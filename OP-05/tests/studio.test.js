const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'operator-studio.html'), 'utf8');

test('production studio uses the maintained Worker and hardened room loop', () => {
  assert.match(html, /beflix-call\.hartswf0\.workers\.dev/);
  assert.match(html, /maybeStartHostOffer\(j\.peers\)/);
  assert.match(html, /pendingRemote\.push/);
  assert.match(html, /loadPersistedFilm/);
  assert.doesNotMatch(html, /MAX_POLLS/);
});

test('API keys never enter the browser client', () => {
  assert.doesNotMatch(html, /id="ai-key"|sk-ant-|anthropic-dangerous-direct-browser-access|x-api-key/);
  assert.match(html, /\/compose/);
  assert.match(html, /Copy prompt/);
});

test('studio has non-blocking recovery and portable exports', () => {
  assert.match(html, /Keep editing/);
  assert.match(html, /Export recovery/);
  assert.match(html, /operator-project\.json/);
  assert.match(html, /MediaRecorder/);
  assert.match(html, /operator-film\.beflix/);
});

test('voice capture requests speech processing', () => {
  assert.match(html, /echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1/);
});

test('BEFLIX interpreter supports animation timing and shifts', () => {
  assert.match(html, /op==='REC'/);
  assert.match(html, /op==='SHF'/);
  assert.match(html, /total>120/);
  assert.match(html, /hold:Math\.max\(1,Math\.min\(15/);
});
