/**
 * OP-06 does not own a production Worker.
 *
 * The branch-studio client is intentionally wired to the maintained Worker in
 * ../OPERATOR at https://beflix-call.hartswf0.workers.dev. This disabled stub
 * prevents an old experiment Worker from being deployed by accident.
 */

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
};

function json(body, status = 410) {
  return new Response(JSON.stringify(body), {
    status,
    headers: CORS_HEADERS,
  });
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
    return json({
      error: 'op06-worker-disabled',
      use: '../OPERATOR',
      worker: 'https://beflix-call.hartswf0.workers.dev',
    });
  },
};

export class Room {
  async fetch() {
    return json({
      error: 'op06-room-disabled',
      use: '../OPERATOR',
      worker: 'https://beflix-call.hartswf0.workers.dev',
    });
  }
}
