/**
 * THUNDER RIGS — OpenAI Responses API proxy for Cloudflare Workers
 *
 * DEPLOY AS A SEPARATE WORKER, or merge the route into the existing
 * multiplayer Worker. The HTML expects:
 *   POST /openai/responses
 *
 * Required Worker secret:
 *   npx wrangler secret put OPENAI_API_KEY
 *
 * Recommended Worker variable:
 *   ALLOWED_ORIGINS = "https://hartswf0.github.io"
 * Multiple origins may be comma-separated. For local file testing only,
 * set ALLOW_NULL_ORIGIN = "true". Do not enable that in production.
 */

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_ALLOWED_ORIGINS = ['https://hartswf0.github.io'];
const MAX_BODY_BYTES = 128 * 1024;

function configuredOrigins(env) {
  const raw = String(env.ALLOWED_ORIGINS || '').trim();
  return raw
    ? raw.split(',').map((value) => value.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;
}

function resolveAllowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return '*'; // curl/server-to-server diagnostics
  if (origin === 'null' && String(env.ALLOW_NULL_ORIGIN || '') === 'true') return 'null';
  return configuredOrigins(env).includes(origin) ? origin : null;
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonResponse(body, status, origin, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(origin),
      ...extra,
    },
  });
}

function getBearerToken(request, env) {
  if (env.OPENAI_API_KEY) return String(env.OPENAI_API_KEY).trim();
  const authorization = request.headers.get('Authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Request body must be a JSON object.';
  }
  if (!payload.model || typeof payload.model !== 'string') {
    return 'A model string is required.';
  }
  if (payload.input === undefined || payload.input === null) {
    return 'An input value is required.';
  }
  return '';
}

export async function handleOpenAIResponses(request, env) {
  const allowedOrigin = resolveAllowedOrigin(request, env);
  if (!allowedOrigin) {
    return new Response('Origin not allowed.', {
      status: 403,
      headers: { 'Cache-Control': 'no-store', 'Vary': 'Origin' },
    });
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(allowedOrigin) });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ error: { message: 'Use POST /openai/responses.' } }, 405, allowedOrigin, {
      Allow: 'POST, OPTIONS',
    });
  }

  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: { message: 'Request body is too large.' } }, 413, allowedOrigin);
  }

  let payload;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: { message: 'Request body is too large.' } }, 413, allowedOrigin);
    }
    payload = JSON.parse(text);
  } catch {
    return jsonResponse({ error: { message: 'Request body must be valid JSON.' } }, 400, allowedOrigin);
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return jsonResponse({ error: { message: validationError } }, 400, allowedOrigin);
  }

  const apiKey = getBearerToken(request, env);
  if (!apiKey) {
    return jsonResponse({
      error: {
        message: 'No OpenAI key is configured. Set the OPENAI_API_KEY Worker secret or send a Bearer key.',
        code: 'missing_api_key',
      },
    }, 401, allowedOrigin);
  }

  // Thunder Rigs does not use streaming. Force a normal JSON response and avoid storage.
  const upstreamPayload = { ...payload, stream: false, store: false };

  let upstream;
  try {
    upstream = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(upstreamPayload),
    });
  } catch (error) {
    return jsonResponse({
      error: {
        message: `OpenAI upstream network failure: ${error instanceof Error ? error.message : String(error)}`,
        code: 'upstream_network_error',
      },
    }, 502, allowedOrigin);
  }

  const body = await upstream.text();
  const headers = {
    'Content-Type': upstream.headers.get('Content-Type') || 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...corsHeaders(allowedOrigin),
  };
  const requestId = upstream.headers.get('x-request-id');
  if (requestId) headers['x-openai-request-id'] = requestId;

  return new Response(body, { status: upstream.status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/openai/responses') {
      return handleOpenAIResponses(request, env);
    }
    return new Response('Not found.', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  },
};
