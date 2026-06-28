import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Room, validateBeflix } from '../worker.js';

class MemoryStorage {
  constructor() {
    this.values = new Map();
    this.alarm = null;
  }

  async get(key) { return this.values.get(key); }
  async put(key, value) { this.values.set(key, structuredClone(value)); }
  async delete(key) { this.values.delete(key); }
  async deleteAll() { this.values.clear(); this.alarm = null; }
  async setAlarm(value) { this.alarm = value; }
}

function request(operation, options = {}) {
  const query = options.query ? `?${new URLSearchParams(options.query)}` : '';
  const init = { method: options.method || 'GET' };
  if (options.body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(options.body);
  }
  return new Request(`https://worker.test/room/test-room/${operation}${query}`, init);
}

async function body(response) {
  return response.json();
}

test('second peer receives an offer created after it joins', async () => {
  const storage = new MemoryStorage();
  const room = new Room({ storage }, {});

  const host = await body(await room.fetch(request('join', { method: 'POST', body: {} })));
  assert.equal(host.role, 'host');
  assert.equal(host.peers, 1);

  const guest = await body(await room.fetch(request('join', { method: 'POST', body: {} })));
  assert.equal(guest.role, 'guest');
  assert.equal(guest.peers, 2);
  assert.deepEqual(guest.roster.map((peer) => peer.role), ['host', 'guest']);

  const offer = { type: 'offer', sdp: { type: 'offer', sdp: 'test-sdp' } };
  const sent = await room.fetch(request('send', {
    method: 'POST',
    body: { peerId: host.peerId, msg: offer },
  }));
  assert.equal(sent.status, 200);

  const poll = await body(await room.fetch(request('poll', {
    query: { peerId: guest.peerId, after: guest.seq },
  })));
  assert.equal(poll.messages.length, 1);
  assert.deepEqual(poll.messages[0].msg, offer);
});

test('guest intent cannot become host before the host joins', async () => {
  const room = new Room({ storage: new MemoryStorage() }, {});
  const response = await room.fetch(request('join', {
    method: 'POST',
    body: { intent: 'guest' },
  }));
  assert.equal(response.status, 409);
  assert.equal((await body(response)).error, 'host-not-ready');

  const host = await body(await room.fetch(request('join', {
    method: 'POST',
    body: { intent: 'host', reset: true },
  })));
  assert.equal(host.role, 'host');

  const guest = await body(await room.fetch(request('join', {
    method: 'POST',
    body: { intent: 'guest' },
  })));
  assert.equal(guest.role, 'guest');
});

test('operator rooms allow mesh peers and host reset clears stale peers', async () => {
  const storage = new MemoryStorage();
  const room = new Room({ storage }, {});
  const peers = [];
  for (let index = 0; index < 6; index += 1) {
    peers.push(await body(await room.fetch(request('join', { method: 'POST', body: {} }))));
  }
  assert.equal(peers[0].role, 'host');
  assert.equal(peers[5].role, 'guest');
  assert.equal(peers[5].peers, 6);

  const full = await room.fetch(request('join', { method: 'POST', body: {} }));
  assert.equal(full.status, 409);
  assert.equal((await body(full)).error, 'room-full');

  const resetHost = await body(await room.fetch(request('join', {
    method: 'POST',
    body: { intent: 'host', reset: true },
  })));
  assert.equal(resetHost.role, 'host');
  assert.equal(resetHost.peers, 1);
  assert.ok(resetHost.epoch > 1);
  assert.deepEqual(resetHost.roster.map((peer) => peer.role), ['host']);
});

test('repeat joins from the same browser tab do not consume extra room slots', async () => {
  const room = new Room({ storage: new MemoryStorage() }, {});
  const hostClient = 'client-host-0001';
  const guestClient = 'client-guest-0001';

  const host = await body(await room.fetch(request('join', {
    method: 'POST',
    body: { intent: 'host', reset: true, clientId: hostClient },
  })));
  assert.equal(host.role, 'host');
  assert.equal(host.peers, 1);

  const duplicateHost = await body(await room.fetch(request('join', {
    method: 'POST',
    body: { intent: 'host', reset: true, clientId: hostClient },
  })));
  assert.equal(duplicateHost.peerId, host.peerId);
  assert.equal(duplicateHost.role, 'host');
  assert.equal(duplicateHost.peers, 1);

  const guest = await body(await room.fetch(request('join', {
    method: 'POST',
    body: { intent: 'guest', clientId: guestClient },
  })));
  assert.equal(guest.role, 'guest');
  assert.equal(guest.peers, 2);

  const duplicateGuest = await body(await room.fetch(request('join', {
    method: 'POST',
    body: { intent: 'guest', clientId: guestClient },
  })));
  assert.equal(duplicateGuest.peerId, guest.peerId);
  assert.equal(duplicateGuest.role, 'guest');
  assert.equal(duplicateGuest.peers, 2);
});

test('unknown peers cannot send or poll room signaling', async () => {
  const room = new Room({ storage: new MemoryStorage() }, {});
  await room.fetch(request('join', { method: 'POST', body: {} }));

  const send = await room.fetch(request('send', {
    method: 'POST',
    body: { peerId: 'not-a-member', msg: { type: 'ice', candidate: {} } },
  }));
  assert.equal(send.status, 403);

  const poll = await room.fetch(request('poll', {
    query: { peerId: 'not-a-member', after: 0 },
  }));
  assert.equal(poll.status, 403);
});

test('guest can request a host-led WebRTC restart', async () => {
  const room = new Room({ storage: new MemoryStorage() }, {});
  const host = await body(await room.fetch(request('join', { method: 'POST', body: {} })));
  const guest = await body(await room.fetch(request('join', { method: 'POST', body: {} })));
  const sent = await room.fetch(request('send', {
    method: 'POST', body: { peerId: guest.peerId, msg: { type: 'restart' } },
  }));
  assert.equal(sent.status, 200);
  const poll = await body(await room.fetch(request('poll', { query: { peerId: host.peerId, after: host.seq } })));
  assert.deepEqual(poll.messages[0].msg, { type: 'restart' });
});

test('directed mesh signaling only reaches the target peer', async () => {
  const room = new Room({ storage: new MemoryStorage() }, {});
  const host = await body(await room.fetch(request('join', { method: 'POST', body: { intent: 'host', reset: true } })));
  const guestA = await body(await room.fetch(request('join', { method: 'POST', body: { intent: 'guest' } })));
  const guestB = await body(await room.fetch(request('join', { method: 'POST', body: { intent: 'guest' } })));

  assert.equal(guestB.peers, 3);
  assert.equal(guestB.roster.length, 3);

  const offer = { type: 'offer', sdp: { type: 'offer', sdp: 'targeted-sdp' } };
  const sent = await room.fetch(request('send', {
    method: 'POST',
    body: { peerId: host.peerId, to: guestA.peerId, msg: offer },
  }));
  assert.equal(sent.status, 200);

  const pollA = await body(await room.fetch(request('poll', {
    query: { peerId: guestA.peerId, after: guestA.seq },
  })));
  const pollB = await body(await room.fetch(request('poll', {
    query: { peerId: guestB.peerId, after: guestB.seq },
  })));
  assert.equal(pollA.messages.length, 1);
  assert.deepEqual(pollA.messages[0].msg, offer);
  assert.equal(pollB.messages.length, 0);
});

test('remaining guest is promoted when the host leaves', async () => {
  const room = new Room({ storage: new MemoryStorage() }, {});
  const host = await body(await room.fetch(request('join', { method: 'POST', body: {} })));
  const guest = await body(await room.fetch(request('join', { method: 'POST', body: {} })));

  const left = await room.fetch(request('leave', {
    method: 'POST',
    body: { peerId: host.peerId },
  }));
  assert.equal(left.status, 200);

  const poll = await body(await room.fetch(request('poll', {
    query: { peerId: guest.peerId, after: 0 },
  })));
  assert.equal(poll.role, 'host');
  assert.equal(poll.peers, 1);
  assert.ok(poll.epoch > guest.epoch);
});

test('host persists a bounded film document across room sessions', async () => {
  const storage = new MemoryStorage();
  const room = new Room({ storage }, {});
  const host = await body(await room.fetch(request('join', { method: 'POST', body: {} })));
  const guest = await body(await room.fetch(request('join', { method: 'POST', body: {} })));
  const film = {
    frames: [{ id: 'frame-0001', grid: 'Ymxhbms=', label: 'SHOT 01', note: 'opening', hold: 2 }],
    hostFrame: 'frame-0001',
    commit: 3,
  };

  const guestWrite = await room.fetch(request('film', {
    method: 'POST', body: { peerId: guest.peerId, film },
  }));
  assert.equal(guestWrite.status, 403);

  const saved = await body(await room.fetch(request('film', {
    method: 'POST', body: { peerId: host.peerId, film },
  })));
  assert.equal(saved.ok, true);
  assert.equal(saved.version, 1);

  await room.fetch(request('leave', { method: 'POST', body: { peerId: host.peerId } }));
  await room.fetch(request('leave', { method: 'POST', body: { peerId: guest.peerId } }));
  assert.ok(await storage.get('film'));
  assert.equal(await storage.get('meta'), undefined);

  const nextHost = await body(await room.fetch(request('join', { method: 'POST', body: {} })));
  const restored = await body(await room.fetch(request('film', {
    query: { peerId: nextHost.peerId },
  })));
  assert.deepEqual(restored.film, film);
  assert.equal(restored.version, 1);

  const removed = await room.fetch(request('film', {
    method: 'DELETE', body: { peerId: nextHost.peerId },
  }));
  assert.equal(removed.status, 200);
  assert.equal(await storage.get('film'), undefined);
});

test('film persistence accepts BEFLIX pause holds through 15 frames', async () => {
  const room = new Room({ storage: new MemoryStorage() }, {});
  const host = await body(await room.fetch(request('join', { method: 'POST', body: {} })));
  const response = await room.fetch(request('film', {
    method: 'POST',
    body: { peerId: host.peerId, film: { frames: [{ id: 'frame-0015', grid: 'Ymxhbms=', label: 'PAUSE', note: '', hold: 15 }] } },
  }));
  assert.equal(response.status, 200);
});

test('BEFLIX composer output is bounded before reaching the browser', () => {
  const code = Array.from({ length: 8 }, (_, index) => [
    `C STATE ${index + 1}`,
    'CLR 0',
    `PNT ${index * 2} 20 4 4 7`,
    'REC 5',
  ].join('\n')).join('\n');
  assert.equal(validateBeflix(code), code);
  assert.equal(validateBeflix('CLR 0\nPNT 127 95 8 8 7\nREC 15'), null);
  assert.equal(validateBeflix('CLR 0\nREC 5'), null);
});

test('composer endpoint requires a server-side API secret', async () => {
  const room = new Room({ storage: new MemoryStorage() }, {});
  const host = await body(await room.fetch(request('join', { method: 'POST', body: {} })));
  const response = await room.fetch(request('compose', {
    method: 'POST', body: { peerId: host.peerId, idea: 'a moving square' },
  }));
  assert.equal(response.status, 503);
  assert.equal((await body(response)).error, 'composer-not-configured');
});

test('client keeps polling and queues ICE received before SDP', async () => {
  const html = await readFile(new URL('../beflix-call.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /MAX_POLLS/);
  assert.match(html, /pendingRemoteCandidates\.push/);
  assert.match(html, /maybeStartHostOffer\(j\.peers\)/);
  assert.match(html, /localStorage\.setItem\(SERVER_STORAGE_KEY/);
});

test('Icaro Quine renderer uses the transmitted PRETEXT envelope as image material', async () => {
  const html = await readFile(new URL('../beflix-call.html', import.meta.url), 'utf8');
  assert.match(html, /function buildQuineField\(raw\)/);
  assert.match(html, /function buildQuineMask\(g\)/);
  assert.match(html, /project\(g,wire\)/);
  assert.match(html, /commit\(g,text\)/);
});
