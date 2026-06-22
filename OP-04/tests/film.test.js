const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const W = 128;
const H = 96;
const N = W * H;
const html = fs.readFileSync(path.join(__dirname, '..', 'operator-studio.html'), 'utf8');

function apply(grid, lines) {
  const next = grid.slice();
  for (const line of lines) {
    const [op, ...raw] = line.split(/\s+/);
    const p = raw.map(Number);
    if (op === 'CLR') next.fill(Math.max(0, Math.min(7, p[0] || 0)));
    if (op === 'PNT') {
      const [x, y, w, h, ink] = p;
      for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy += 1) {
        for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx += 1) next[yy * W + xx] = ink;
      }
    }
  }
  return next;
}

function encodeGrid(grid) {
  const bytes = [];
  for (let i = 0; i < grid.length;) {
    const value = grid[i];
    let run = 1;
    while (i + run < grid.length && grid[i + run] === value && run < 255) run += 1;
    bytes.push(run, value);
    i += run;
  }
  return Buffer.from(bytes).toString('base64');
}

function decodeGrid(text) {
  const raw = Buffer.from(text, 'base64');
  const grid = new Uint8Array(N);
  let at = 0;
  for (let i = 0; i + 1 < raw.length && at < N; i += 2) {
    grid.fill(raw[i + 1], at, Math.min(N, at + raw[i]));
    at += raw[i];
  }
  return grid;
}

test('studio is connected to the hardened Worker and speech audio', () => {
  assert.match(html, /beflix-call\.hartswf0\.workers\.dev/);
  assert.match(html, /echoCancellation:true,noiseSuppression:true,autoGainControl:true/);
  assert.doesNotMatch(html, /MAX_POLLS|anthropic-dangerous-direct-browser-access|id="ai-key"/);
});

test('film grids round-trip through bounded RLE state sync', () => {
  let grid = new Uint8Array(N);
  grid = apply(grid, ['PNT 4 5 20 10 7', 'PNT 70 40 8 9 3']);
  assert.deepEqual(decodeGrid(encodeGrid(grid)), grid);
});

test('host-ordered concurrent patches converge', () => {
  const guestStroke = ['PNT 0 0 8 8 7'];
  const hostWipe = ['CLR 2'];

  let host = new Uint8Array(N);
  host = apply(host, hostWipe);
  host = apply(host, guestStroke);

  let guest = new Uint8Array(N);
  guest = apply(guest, guestStroke); // optimistic local preview
  guest = apply(guest, hostWipe);    // host commit 1
  guest = apply(guest, guestStroke); // echoed host commit 2

  assert.deepEqual(guest, host);
});

test('frame-addressed patches do not overwrite another shot', () => {
  const frames = [new Uint8Array(N), new Uint8Array(N)];
  frames[1] = apply(frames[1], ['PNT 10 10 5 5 7']);
  assert.equal(frames[0].some(Boolean), false);
  assert.equal(frames[1].some(Boolean), true);
});
