import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Room } from '../worker.js';

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
