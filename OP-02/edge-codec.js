// edge-codec.js — the badass-fast string-video core.
// ============================================================================
// THEORY: optimize for "a face legible as text on the least network."
//   - Edges (not fills) carry facial recognition AND are sparse -> tiny.
//   - Wire format is a FIXED-GRAMMAR BINARY packet (ArrayBuffer), not a string:
//     no string parsing on the hot path.
//   - The "string" (the quine code view) is reconstructed LAZILY from the same
//     bytes only when displayed, so it costs ~0 per frame.
// ============================================================================
const W = 128, H = 96, N = W * H;

// ---- Sobel edge magnitude -> 0..7 edge-strength grid (one tight pass) ----
// 0 = no edge (background), 1..7 = increasing edge strength.
function edgeGrid(luma) {
  const g = new Uint8Array(N);
  let mx = 0;
  const mag = new Float32Array(N);
  // interior only; borders stay 0
  for (let y = 1; y < H - 1; y++) {
    const r0 = (y - 1) * W, r1 = y * W, r2 = (y + 1) * W;
    for (let x = 1; x < W - 1; x++) {
      const a = luma[r0 + x - 1], b = luma[r0 + x], c = luma[r0 + x + 1];
      const d = luma[r1 + x - 1],                 f = luma[r1 + x + 1];
      const h = luma[r2 + x - 1], i = luma[r2 + x], j = luma[r2 + x + 1];
      const gx = -a - 2 * d - h + c + 2 * f + j;
      const gy = -a - 2 * b - c + h + 2 * i + j;
      const m = Math.abs(gx) + Math.abs(gy); // L1 norm: faster than sqrt, fine for thresholding
      mag[r1 + x] = m;
      if (m > mx) mx = m;
    }
  }
  if (mx < 1) return g; // flat frame -> all zero
  const thresh = mx * 0.18, span = mx - thresh || 1;
  for (let k = 0; k < N; k++) {
    const m = mag[k];
    g[k] = m < thresh ? 0 : Math.min(7, 1 + ((m - thresh) / span * 6 + 0.5 | 0));
  }
  return g;
}

// ---- BINARY frame: RLE over the sparse edge grid ----
// Format (all bytes):
//   [0]      magic 0xBE
//   [1]      version 0x01
//   [2..3]   seq (uint16 LE)
//   [4]      kind: 0=full
//   [5..]    RLE body, then 0xFF terminator
// RLE body tokens:
//   0x00 LEN            -> LEN zero-cells (LEN 1..254)
//   0x01 LEN <nibbles>  -> LEN non-zero cells, packed 2 per byte (hi,lo)
// Constant-ish, tiny, no string parsing.
function packEdge(grid, seq) {
  const out = []; // bytes
  out.push(0xBE, 0x01, seq & 0xFF, (seq >> 8) & 0xFF, 0x00);
  let i = 0, guard = 0;
  while (i < N && guard++ < N + 10) {
    if (grid[i] === 0) {
      let run = 0;
      while (i < N && grid[i] === 0 && run < 254) { run++; i++; }
      out.push(0x00, run);
    } else {
      const start = i; let run = 0;
      while (i < N && grid[i] !== 0 && run < 254) { run++; i++; }
      out.push(0x01, run);
      // pack `run` nibbles, 2 per byte
      for (let k = 0; k < run; k += 2) {
        const hi = grid[start + k] & 0x0F;
        const lo = (k + 1 < run) ? (grid[start + k + 1] & 0x0F) : 0;
        out.push((hi << 4) | lo);
      }
    }
  }
  out.push(0xFF);
  return new Uint8Array(out);
}

function unpackEdge(bytes) {
  if (bytes[0] !== 0xBE || bytes[1] !== 0x01) return null;
  const seq = bytes[2] | (bytes[3] << 8);
  const grid = new Uint8Array(N);
  let p = 5, cell = 0, guard = 0;
  while (p < bytes.length && bytes[p] !== 0xFF && cell < N && guard++ < N + 10) {
    const tok = bytes[p++];
    if (tok === 0x00) {
      const run = bytes[p++];
      cell += run; // zeros: grid already 0
    } else if (tok === 0x01) {
      const run = bytes[p++];
      for (let k = 0; k < run; k += 2) {
        const byte = bytes[p++];
        if (cell < N) grid[cell++] = (byte >> 4) & 0x0F;
        if (k + 1 < run && cell < N) grid[cell++] = byte & 0x0F;
      }
    } else break; // unknown token -> stop (data-safe)
  }
  return { seq, grid };
}

// ---- LAZY text view (quine surface) ----
// Reconstructed from a grid ONLY when displayed. Renders the edge grid as
// glyph line-art. This is the "video as a string" view; it is not on the wire.
const RAMP = [' ', '.', ':', '-', '=', '+', '#', '@'];
function gridToText(grid) {
  let out = '';
  for (let y = 0; y < H; y += 2) {
    const rb = y * W;
    for (let x = 0; x < W; x++) out += RAMP[grid[rb + x]];
    out += '\n';
  }
  return out;
}

module.exports = { W, H, N, edgeGrid, packEdge, unpackEdge, gridToText };

// ============================== TESTS ==============================
if (require.main === module) {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { c ? pass++ : fail++; console.log((c ? '  ok  ' : 'FAIL  ') + n + (x ? '  ' + x : '')); };

  // synthetic face luma
  const L = new Float32Array(N).fill(210);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const nx = (x - 64) / 38, ny = (y - 50) / 44; if (nx * nx + ny * ny < 1) L[y * W + x] = 150; }
  const blk = (x0, y0, w, h, v) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (x >= 0 && x < W && y >= 0 && y < H) L[y * W + x] = v; };
  blk(46, 40, 12, 6, 40); blk(72, 40, 12, 6, 40); blk(52, 66, 24, 4, 60);

  const g = edgeGrid(L);

  // 1. binary round-trip is EXACT
  const packed = packEdge(g, 1234);
  const back = unpackEdge(packed);
  let identical = back && back.seq === 1234;
  for (let i = 0; i < N; i++) if (g[i] !== back.grid[i]) { identical = false; break; }
  ok('binary round-trip exact (grid + seq)', identical);
  console.log('  packed size:', packed.length, 'bytes');

  // 2. it's small
  ok('packet under 2KB', packed.length < 2048, packed.length + ' B');

  // 3. corrupt/short data is safe (no crash, no overrun)
  const truncated = packed.slice(0, 12);
  const r = unpackEdge(truncated);
  ok('truncated packet decodes safely', r !== null && r.grid.length === N);

  // 4. unknown magic rejected
  ok('bad magic rejected', unpackEdge(new Uint8Array([0,0,0,0,0])) === null);

  // 5. text view reproduces from the SAME grid (quine property holds for the view)
  const t1 = gridToText(g);
  const t2 = gridToText(unpackEdge(packed).grid);
  ok('text view identical from packed bytes (quine)', t1 === t2);

  // 6. timing: encode+pack+unpack 100 frames (proxy for old-phone budget)
  const t0 = process.hrtime.bigint();
  for (let n = 0; n < 100; n++) { const gg = edgeGrid(L); const pk = packEdge(gg, n); unpackEdge(pk); }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  console.log('  100 frames encode+pack+unpack:', ms.toFixed(1), 'ms  (' + (ms / 100).toFixed(2) + ' ms/frame)');
  ok('per-frame budget < 5ms (desktop node proxy)', ms / 100 < 5);

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
