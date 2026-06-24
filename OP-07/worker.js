/**
 * OP-07 does not own a production Worker.
 *
 * The maintained multiplayer / TURN / composer Worker lives in ../OPERATOR
 * and is deployed at:
 *
 *   https://beflix-call.hartswf0.workers.dev
 *
 * This file is intentionally a disabled compatibility stub so an accidental
 * `wrangler deploy` from OP-07 cannot replace the live service with an older
 * signaling protocol.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
};

function json(body, status = 410) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

const DISABLED = {
  error: 'op07-worker-disabled',
  use: '../OPERATOR/worker.js',
  worker: 'https://beflix-call.hartswf0.workers.dev',
  reason: 'OP-07 is a static client experiment wired to the maintained OPERATOR Worker.',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    return json(DISABLED);
  },
};

export class Room {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    return json({
      ...DISABLED,
      error: 'op07-room-disabled',
    });
  }
}
