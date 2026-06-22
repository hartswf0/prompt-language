/**
 * BEFLIX Call signaling and TURN credential Worker.
 *
 * Live video, audio, and chat never pass through this Worker. It coordinates a
 * two-peer WebRTC handshake, returns short-lived relay credentials, and stores
 * OP-04's bounded, compact shared-film document for room restoration.
 */

const MAX_MSGS = 64;
const MAX_MSG_BYTES = 16 * 1024;
const MAX_FILM_BYTES = 512 * 1024;
const MAX_FILM_FRAMES = 48;
const ROOM_TTL_MS = 15 * 60 * 1000;
const FILM_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PEER_LEASE_MS = 2 * 60 * 1000;
const TURN_TTL_S = 3600;
const MESSAGE_TYPES = new Set(['offer', 'answer', 'ice']);

function configuredOrigins(env) {
  return (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function requestOrigin(request) {
  return (request.headers.get('Origin') || '').replace(/\/$/, '');
}

function originAllowed(request, env) {
  const origin = requestOrigin(request);
  if (!origin) return true; // health checks and non-browser clients
  const allowed = configuredOrigins(env);
  return allowed.length === 0 || allowed.includes(origin);
}

function responseHeaders(request, env, extra = {}) {
  const origin = requestOrigin(request);
  const headers = {
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
    ...extra,
  };
  if (origin && originAllowed(request, env)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(request, env, { 'Content-Type': 'application/json' }),
  });
}

async function readJson(request, maxBytes = MAX_MSG_BYTES) {
  const declared = Number(request.headers.get('Content-Length') || 0);
  if (declared > maxBytes) return null;
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) return null;
  try {
    return JSON.parse(text || '{}');
  } catch {
    return null;
  }
}

function validFilmDocument(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.frames)) return false;
  if (value.frames.length < 1 || value.frames.length > MAX_FILM_FRAMES) return false;
  return value.frames.every((frame) => frame
    && typeof frame.id === 'string'
    && frame.id.length >= 4
    && frame.id.length <= 64
    && typeof frame.grid === 'string'
    && frame.grid.length <= 64 * 1024
    && typeof frame.label === 'string'
    && frame.label.length <= 32
    && typeof frame.note === 'string'
    && frame.note.length <= 120
    && Number.isInteger(frame.hold)
    && frame.hold >= 1
    && frame.hold <= 12);
}

function newPeerId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    if (!originAllowed(request, env)) return json(request, env, { error: 'origin-not-allowed' }, 403);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: responseHeaders(request, env) });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');

    if (path.endsWith('/health') && request.method === 'GET') {
      return json(request, env, {
        ok: true,
        service: 'beflix-signaling',
        turn: env.CF_TURN_KEY_ID && env.CF_TURN_API_TOKEN
          ? 'cloudflare'
          : env.TURN_SECRET && env.TURN_URLS
            ? 'coturn'
            : 'stun-only',
      });
    }

    if (path.endsWith('/turn') && request.method === 'GET') return handleTurn(request, env);

    const match = path.match(/\/room\/([A-Za-z0-9_-]{16,64})\/(join|send|poll|leave|film)$/);
    if (match) {
      const id = env.ROOMS.idFromName(match[1]);
      return env.ROOMS.get(id).fetch(request);
    }

    return json(request, env, { error: 'not-found' }, 404);
  },
};

async function handleTurn(request, env) {
  if (env.CF_TURN_KEY_ID && env.CF_TURN_API_TOKEN) {
    const endpoint = `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(env.CF_TURN_KEY_ID)}/credentials/generate-ice-servers`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CF_TURN_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ttl: TURN_TTL_S }),
    });
    if (!response.ok) return json(request, env, { error: 'turn-provider-failed' }, 502);
    const payload = await response.json();
    return json(request, env, { iceServers: payload.iceServers, ttl: TURN_TTL_S });
  }

  if (env.TURN_SECRET && env.TURN_URLS) {
    const expiry = Math.floor(Date.now() / 1000) + TURN_TTL_S;
    const username = `${expiry}:beflix`;
    const credential = await hmacSha1Base64(username, env.TURN_SECRET);
    const turnUrls = env.TURN_URLS.split(',').map((value) => value.trim()).filter(Boolean);
    return json(request, env, {
      iceServers: [
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: turnUrls, username, credential },
      ],
      ttl: TURN_TTL_S,
    });
  }

  return json(request, env, {
    iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
    note: 'No TURN provider configured; direct connections only.',
  });
}

async function hmacSha1Base64(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  let binary = '';
  for (const byte of new Uint8Array(signature)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function emptyMeta(now) {
  return { seq: 0, peers: [], last: now, epoch: 1 };
}

function normalizeMeta(value, now) {
  if (!value || !Array.isArray(value.peers)) return emptyMeta(now);
  value.epoch = Number(value.epoch) || 1;
  value.seq = Number(value.seq) || 0;
  value.last = Number(value.last) || now;
  value.peers = value.peers.filter((peer) => peer && typeof peer.id === 'string');
  return value;
}

function findPeer(meta, peerId) {
  return meta.peers.find((peer) => peer.id === peerId);
}

function reconcilePeers(meta, now) {
  const previousHost = meta.peers.find((peer) => peer.role === 'host');
  meta.peers = meta.peers.filter((peer) => now - peer.last <= PEER_LEASE_MS);
  let reset = false;

  if (meta.peers.length === 0) {
    reset = meta.seq !== 0;
    meta.seq = 0;
  } else if (!meta.peers.some((peer) => peer.role === 'host')) {
    meta.peers[0].role = 'host';
    meta.epoch += 1;
    meta.seq = 0;
    reset = true;
  } else if (previousHost && !findPeer(meta, previousHost.id)) {
    meta.epoch += 1;
    meta.seq = 0;
    reset = true;
  }

  return reset;
}

export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async loadMeta(now) {
    const meta = normalizeMeta(await this.state.storage.get('meta'), now);
    const resetMessages = reconcilePeers(meta, now);
    if (resetMessages) await this.state.storage.delete('msgs');
    return meta;
  }

  async saveMeta(meta, now) {
    meta.last = now;
    await this.state.storage.put('meta', meta);
    await this.state.storage.setAlarm(now + ROOM_TTL_MS);
  }

  async fetch(request) {
    if (!originAllowed(request, this.env)) return json(request, this.env, { error: 'origin-not-allowed' }, 403);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: responseHeaders(request, this.env) });
    }

    const now = Date.now();
    const url = new URL(request.url);
    const path = url.pathname;
    const meta = await this.loadMeta(now);

    if (path.endsWith('/join') && request.method === 'POST') {
      if (meta.peers.length >= 2) return json(request, this.env, { error: 'room-full' }, 409);
      const peer = {
        id: newPeerId(),
        role: meta.peers.length === 0 ? 'host' : 'guest',
        last: now,
      };
      meta.peers.push(peer);
      await this.saveMeta(meta, now);
      return json(request, this.env, {
        peerId: peer.id,
        role: peer.role,
        seq: meta.seq,
        peers: meta.peers.length,
        epoch: meta.epoch,
      });
    }

    if (path.endsWith('/send') && request.method === 'POST') {
      const body = await readJson(request);
      const peer = body && findPeer(meta, body.peerId);
      if (!peer) return json(request, this.env, { error: 'invalid-peer' }, 403);
      if (!body.msg || typeof body.msg !== 'object' || !MESSAGE_TYPES.has(body.msg.type)) {
        return json(request, this.env, { error: 'bad-message' }, 400);
      }
      const encoded = JSON.stringify(body.msg);
      if (new TextEncoder().encode(encoded).byteLength > MAX_MSG_BYTES) {
        return json(request, this.env, { error: 'too-large' }, 413);
      }

      peer.last = now;
      meta.seq += 1;
      const messages = (await this.state.storage.get('msgs')) || [];
      messages.push({ seq: meta.seq, from: peer.id, msg: body.msg, time: now, epoch: meta.epoch });
      if (messages.length > MAX_MSGS) messages.splice(0, messages.length - MAX_MSGS);
      await this.state.storage.put('msgs', messages);
      await this.saveMeta(meta, now);
      return json(request, this.env, { ok: true, seq: meta.seq });
    }

    if (path.endsWith('/poll') && request.method === 'GET') {
      const peerId = url.searchParams.get('peerId') || '';
      const peer = findPeer(meta, peerId);
      if (!peer) return json(request, this.env, { error: 'invalid-peer' }, 403);
      const after = Math.max(0, Number.parseInt(url.searchParams.get('after') || '0', 10) || 0);
      const messages = (await this.state.storage.get('msgs')) || [];
      peer.last = now;
      await this.saveMeta(meta, now);
      return json(request, this.env, {
        messages: messages.filter((entry) => entry.epoch === meta.epoch && entry.seq > after && entry.from !== peer.id),
        seq: meta.seq,
        peers: meta.peers.length,
        role: peer.role,
        epoch: meta.epoch,
      });
    }

    if (path.endsWith('/film') && request.method === 'GET') {
      const peerId = url.searchParams.get('peerId') || '';
      const peer = findPeer(meta, peerId);
      if (!peer) return json(request, this.env, { error: 'invalid-peer' }, 403);
      const record = await this.state.storage.get('film');
      peer.last = now;
      await this.saveMeta(meta, now);
      return json(request, this.env, record
        ? { film: record.document, version: record.version, updated: record.updated }
        : { film: null, version: 0 });
    }

    if (path.endsWith('/film') && request.method === 'POST') {
      const body = await readJson(request, MAX_FILM_BYTES);
      const peer = body && findPeer(meta, body.peerId);
      if (!peer) return json(request, this.env, { error: 'invalid-peer' }, 403);
      if (peer.role !== 'host') return json(request, this.env, { error: 'host-only' }, 403);
      if (!validFilmDocument(body.film)) return json(request, this.env, { error: 'bad-film' }, 400);
      const previous = await this.state.storage.get('film');
      const version = (previous && Number(previous.version) || 0) + 1;
      await this.state.storage.put('film', { document: body.film, version, updated: now });
      peer.last = now;
      await this.saveMeta(meta, now);
      return json(request, this.env, { ok: true, version, updated: now });
    }

    if (path.endsWith('/film') && request.method === 'DELETE') {
      const body = await readJson(request, 1024);
      const peer = body && findPeer(meta, body.peerId);
      if (!peer) return json(request, this.env, { error: 'invalid-peer' }, 403);
      if (peer.role !== 'host') return json(request, this.env, { error: 'host-only' }, 403);
      await this.state.storage.delete('film');
      peer.last = now;
      await this.saveMeta(meta, now);
      return json(request, this.env, { ok: true });
    }

    if (path.endsWith('/leave') && request.method === 'POST') {
      const body = await readJson(request, 1024);
      const peer = body && findPeer(meta, body.peerId);
      if (!peer) return json(request, this.env, { error: 'invalid-peer' }, 403);
      meta.peers = meta.peers.filter((candidate) => candidate.id !== peer.id);
      const resetMessages = reconcilePeers(meta, now);
      if (resetMessages || meta.peers.length === 0) await this.state.storage.delete('msgs');
      if (meta.peers.length === 0) {
        const film = await this.state.storage.get('film');
        if (film) {
          await this.state.storage.delete('meta');
          await this.state.storage.setAlarm(Number(film.updated) + FILM_TTL_MS);
        } else {
          await this.state.storage.deleteAll();
        }
      } else {
        await this.saveMeta(meta, now);
      }
      return json(request, this.env, { ok: true });
    }

    return json(request, this.env, { error: 'bad-room-operation' }, 400);
  }

  async alarm() {
    const now = Date.now();
    const storedMeta = await this.state.storage.get('meta');
    const film = await this.state.storage.get('film');
    if (!storedMeta) {
      if (!film || now - Number(film.updated || 0) >= FILM_TTL_MS) {
        await this.state.storage.deleteAll();
      } else {
        await this.state.storage.setAlarm(Number(film.updated) + FILM_TTL_MS);
      }
      return;
    }
    const meta = normalizeMeta(storedMeta, now);
    if (now - meta.last >= ROOM_TTL_MS) {
      if (!film || now - Number(film.updated || 0) >= FILM_TTL_MS) {
        await this.state.storage.deleteAll();
        return;
      }
      await this.state.storage.delete('meta');
      await this.state.storage.delete('msgs');
      await this.state.storage.setAlarm(Number(film.updated) + FILM_TTL_MS);
      return;
    }
    await this.state.storage.setAlarm(meta.last + ROOM_TTL_MS);
  }
}
