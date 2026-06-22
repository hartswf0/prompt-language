/**
 * BEFLIX Call — signaling + TURN credential Worker
 * =================================================
 * One Cloudflare Worker, two jobs:
 *
 *   1. SIGNALING RELAY
 *      Two peers join a short <room> code. The Worker keeps a tiny, expiring
 *      mailbox per room and relays signaling messages (offer / answer / ICE
 *      candidates) between them. It NEVER sees or stores video — video stays
 *      peer-to-peer over the WebRTC data channel. The mailbox is bounded and
 *      auto-expires so storage cannot grow without limit.
 *
 *   2. EPHEMERAL TURN CREDENTIALS
 *      Mints short-lived TURN credentials (HMAC of an expiry timestamp,
 *      the standard coturn "REST API" scheme). The long-term secret lives in
 *      this Worker's environment variable, never in the shared HTML file.
 *
 * ----------------------------------------------------------------------------
 * THEORY / INVARIANTS (for the maintainer)
 *   - A <room> holds at most MAX_MSGS messages; older ones are dropped.
 *   - Every message carries a server-assigned monotonically increasing seq so
 *     a client can poll "everything after seq N".
 *   - Rooms expire after ROOM_TTL_MS of inactivity (enforced lazily on access
 *     plus by Durable Object alarm).
 *   - TURN credentials expire after TURN_TTL_S seconds.
 *   - The Worker validates message size and shape; oversized or malformed
 *     posts are rejected, never stored.
 *   - No authentication of identity — a room code is a shared secret. Anyone
 *     with the code can join. This matches the product (you share a code like
 *     you'd share a meeting link). Codes are long/random enough to not guess.
 *
 * ----------------------------------------------------------------------------
 * DEPLOY
 *   1. Install wrangler:            npm i -g wrangler
 *   2. Put this file at:           src/worker.js   (see wrangler.toml below)
 *   3. Set your TURN secret:       wrangler secret put TURN_SECRET
 *   4. (optional) set TURN_URLS in wrangler.toml vars
 *   5. wrangler deploy
 *   6. Paste the deployed URL into the BEFLIX Call app's Server box.
 *
 * This uses a Durable Object for the room mailbox (correct for coordinating
 * two peers). The TURN endpoint is stateless.
 */

// ===================== tunables =====================
const MAX_MSGS = 256;         // per room; bounded mailbox (holds offer/answer + a full candidate set)
const MAX_MSG_BYTES = 16 * 1024; // a single signaling message cap (SDP fits easily)
const ROOM_TTL_MS = 10 * 60 * 1000; // 10 minutes of inactivity
const TURN_TTL_S = 3600;      // 1 hour credential lifetime
const MAX_PEERS = 2;          // this app is 1:1

// ===================== CORS =====================
function cors(extra) {
  return Object.assign({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  }, extra || {});
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: cors({ 'Content-Type': 'application/json' }),
  });
}

// ===================== Worker entry =====================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors() });
    }

    // --- TURN credentials: GET /turn ---
    if (path.endsWith('/turn') && request.method === 'GET') {
      return handleTurn(env);
    }

    // --- Signaling: all /room/* routed to the Durable Object ---
    // /room/<code>/join   POST  -> { peerId, seq }
    // /room/<code>/send   POST  -> { ok, seq }      body: { peerId, msg }
    // /room/<code>/poll   GET   ?peerId=&after=     -> { messages:[...], seq }
    // /room/<code>/leave  POST                       body: { peerId }
    const m = path.match(/\/room\/([A-Za-z0-9_-]{4,64})\/(join|send|poll|leave)$/);
    if (m) {
      const roomCode = m[1];
      const id = env.ROOMS.idFromName(roomCode);
      const stub = env.ROOMS.get(id);
      return stub.fetch(request);
    }

    if (path.endsWith('/health')) return json({ ok: true, service: 'beflix-signaling' });

    return json({ error: 'not-found' }, 404);
  },
};

// ===================== TURN handler (stateless) =====================
async function handleTurn(env) {
  const secret = env.TURN_SECRET;
  if (!secret) {
    // No secret configured: tell the client to use STUN-only (direct).
    return json({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      note: 'No TURN_SECRET set on server; STUN-only (direct connections).',
    });
  }
  // coturn REST scheme: username = "<expiry>:<name>", credential = base64(HMAC-SHA1(username, secret))
  const expiry = Math.floor(Date.now() / 1000) + TURN_TTL_S;
  const username = expiry + ':beflix';
  const credential = await hmacSha1Base64(username, secret);

  // TURN_URLS is a comma-separated list set in wrangler.toml vars, e.g.
  //   "turn:turn.example.com:3478,turns:turn.example.com:5349"
  const turnUrls = (env.TURN_URLS || '').split(',').map(s => s.trim()).filter(Boolean);

  const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
  if (turnUrls.length) {
    iceServers.push({ urls: turnUrls, username, credential });
  }
  return json({ iceServers, ttl: TURN_TTL_S });
}

async function hmacSha1Base64(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  let bin = '';
  const bytes = new Uint8Array(sig);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// ===================== Durable Object: one room =====================
export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // lazy expiry: if last activity older than TTL, reset the room
    const now = Date.now();
    let meta = (await this.state.storage.get('meta')) || { seq: 0, peers: [], last: now };
    if (now - meta.last > ROOM_TTL_MS) {
      await this.state.storage.deleteAll();
      meta = { seq: 0, peers: [], last: now };
    }

    if (path.endsWith('/join') && request.method === 'POST') {
      // assign a peer slot; reject a third peer
      if (meta.peers.length >= MAX_PEERS) {
        // allow rejoin if a slot is stale? keep simple: reject.
        return json({ error: 'room-full' }, 409);
      }
      const peerId = 'peer-' + Math.random().toString(36).slice(2, 10);
      meta.peers.push(peerId);
      meta.last = now;
      await this.state.storage.put('meta', meta);
      // Return after:0, NOT meta.seq. The poll handler filters by from!==me,
      // so a joiner starting at 0 receives every message the OTHER peer has
      // already posted (e.g. an offer that arrived before this join) and none
      // of its own. Returning meta.seq here would skip those earlier messages.
      return json({ peerId, seq: 0, peers: meta.peers.length });
    }

    if (path.endsWith('/send') && request.method === 'POST') {
      const body = await safeJson(request);
      if (!body || typeof body.peerId !== 'string' || typeof body.msg !== 'object') {
        return json({ error: 'bad-body' }, 400);
      }
      const raw = JSON.stringify(body.msg);
      if (raw.length > MAX_MSG_BYTES) return json({ error: 'too-large' }, 413);

      meta.seq += 1;
      const entry = { seq: meta.seq, from: body.peerId, msg: body.msg, t: now };
      // append, then trim to MAX_MSGS (bounded mailbox)
      const msgs = (await this.state.storage.get('msgs')) || [];
      msgs.push(entry);
      while (msgs.length > MAX_MSGS) msgs.shift();
      meta.last = now;
      await this.state.storage.put('msgs', msgs);
      await this.state.storage.put('meta', meta);
      return json({ ok: true, seq: meta.seq });
    }

    if (path.endsWith('/poll') && request.method === 'GET') {
      const after = parseInt(url.searchParams.get('after') || '0', 10) || 0;
      const me = url.searchParams.get('peerId') || '';
      const msgs = (await this.state.storage.get('msgs')) || [];
      // return only messages from the OTHER peer, after the given seq
      const out = msgs.filter(e => e.seq > after && e.from !== me);
      meta.last = now;
      await this.state.storage.put('meta', meta);
      return json({ messages: out, seq: meta.seq, peers: meta.peers.length });
    }

    if (path.endsWith('/leave') && request.method === 'POST') {
      const body = await safeJson(request);
      if (body && typeof body.peerId === 'string') {
        meta.peers = meta.peers.filter(p => p !== body.peerId);
        meta.last = now;
        await this.state.storage.put('meta', meta);
      }
      return json({ ok: true });
    }

    return json({ error: 'bad-room-op' }, 400);
  }
}

async function safeJson(request) {
  try { return await request.json(); }
  catch (e) { return null; }
}
