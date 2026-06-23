const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'operator-studio.html'), 'utf8');
const wrangler = fs.readFileSync(path.join(__dirname, '..', 'wrangler.toml'), 'utf8');
const worker = fs.readFileSync(path.join(__dirname, '..', 'worker.js'), 'utf8');

test('branch studio uses the maintained deployed Worker by default', () => {
  assert.match(html, /beflix-call\.hartswf0\.workers\.dev/);
  assert.match(html, /meta name="beflix-worker-url"/);
  assert.match(html, /Rooms live/);
  assert.match(html, /composer needs OPENAI_API_KEY/);
});

test('room signaling has no fixed timeout and waits for both peers', () => {
  assert.doesNotMatch(html, /MAX_POLLS|poll limit|setInterval\(function\(\)\{room\.polls/);
  assert.match(html, /maybeStartHostOffer\(j\.peers\)/);
  assert.match(html, /POLL_MAX_BACKOFF_MS/);
  assert.match(html, /room\.pendingRemote\.push/);
  assert.match(html, /joinRoom\(true\)/);
});

test('server-side composer does not expose browser API keys', () => {
  assert.doesNotMatch(html, /id="ai-key"|sk-ant-|anthropic-dangerous-direct-browser-access|x-api-key|\/ai\b/);
  assert.match(html, /\/compose/);
  assert.match(html, /join-room-first/);
  assert.match(html, /localComposeAnim/);
});

test('legacy OP-06 worker cannot overwrite production worker by default', () => {
  assert.match(wrangler, /beflix-call-op06-legacy-do-not-deploy/);
  assert.doesNotMatch(wrangler, /name = "beflix-call"/);
  assert.match(worker, /op06-worker-disabled/);
  assert.doesNotMatch(worker, /ANTHROPIC_KEY|OPENAI_API_KEY|x-api-key|api\.openai\.com|anthropic\.com/);
});
