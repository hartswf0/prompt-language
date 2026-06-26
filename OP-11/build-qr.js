#!/usr/bin/env node
/* build-qr.js — vendor a proven, dependency-free QR encoder into operator-studio.html.
 *
 * WHY: a hand-rolled QR encoder can produce codes that look right but won't scan.
 * This pulls a battle-tested implementation, verifies it actually encodes, and splices
 * it inline so the shipped HTML has ZERO runtime/network dependencies.
 *
 * USAGE (on a machine with network access):
 *     node build-qr.js
 *     node build-qr.js path/to/operator-studio.html
 *
 * It rewrites the file in place (a .bak is written first).
 *
 * What it vendors: `qrcode-generator` by Kazuhiko Arase (MIT) — the reference
 * implementation most browser QR libraries derive from. Falls back to the davidshimjs
 * qrcodejs UMD build if the first source is unreachable.
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const TARGET = process.argv[2] || path.join(__dirname, 'operator-studio.html');

// Candidate sources, tried in order. Each must expose a constructor we can drive.
const SOURCES = [
  {
    name: 'qrcode-generator@1.4.4 (Arase, MIT)',
    url: 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js',
    // Arase API: qrcode(typeNumber, errorCorrectionLevel); .addData(); .make(); .getModuleCount(); .isDark(r,c)
    adapter: `
/* Adapter: expose window.QRMini.encode(text, ec) -> boolean[][] (true = dark). */
(function(g){
  function encode(text, ec){
    ec = (ec||'M').toUpperCase();
    // typeNumber 0 = auto-fit
    var q = qrcode(0, ec);
    q.addData(text);
    q.make();
    var n = q.getModuleCount();
    var out = [];
    for (var r=0;r<n;r++){ var row=[]; for (var c=0;c<n;c++){ row.push(!!q.isDark(r,c)); } out.push(row); }
    return out;
  }
  g.QRMini = { encode: encode };
})(typeof window!=='undefined'?window:this);
`
  },
  {
    name: 'qrcodejs (davidshimjs, MIT)',
    url: 'https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js',
    // qrcodejs exposes QRCode with an internal _oQRCode after creation; we drive the model class.
    adapter: `
/* Adapter for qrcodejs: build a hidden model and read its modules. */
(function(g){
  function encode(text, ec){
    var levels = { L:1, M:0, Q:3, H:2 }; // QRCode.CorrectLevel mapping
    // qrcodejs needs a DOM node; create a detached one.
    var holder = document.createElement('div');
    var qr = new QRCode(holder, { text: text, correctLevel: (typeof QRCode.CorrectLevel!=='undefined') ? QRCode.CorrectLevel[ec||'M'] : 0, width:256, height:256 });
    var model = qr._oQRCode || (qr._htOption && qr._oQRCode);
    if(!model || typeof model.getModuleCount!=='function'){ throw new Error('qrcodejs model unavailable'); }
    var n = model.getModuleCount(); var out=[];
    for(var r=0;r<n;r++){ var row=[]; for(var c=0;c<n;c++){ row.push(!!model.isDark(r,c)); } out.push(row); }
    return out;
  }
  g.QRMini = { encode: encode };
})(typeof window!=='undefined'?window:this);
`
  }
];

function fetchText(url){
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchText(res.headers.location));
      }
      if (res.statusCode !== 200) { reject(new Error('HTTP '+res.statusCode+' for '+url)); res.resume(); return; }
      let data = ''; res.setEncoding('utf8');
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Validate the vendored encoder by running it in a throwaway VM with a minimal DOM shim
// and checking the output has the structural hallmarks of a real QR code.
function validate(libSource, adapterSource){
  const vm = require('vm');
  // Minimal DOM shim sufficient for qrcodejs's detached-node path; Arase needs none.
  const documentShim = {
    createElement(){ return { appendChild(){}, style:{}, getContext(){ return { fillRect(){}, clearRect(){}, fillStyle:'' }; }, childNodes:[], innerHTML:'' }; },
  };
  const sandbox = { window:{}, document:documentShim, navigator:{ userAgent:'node' }, console };
  sandbox.window.document = documentShim;
  vm.createContext(sandbox);
  try {
    vm.runInContext(libSource + '\n' + adapterSource, sandbox, { timeout: 5000 });
  } catch (e) {
    return { ok:false, reason:'execution threw: '+e.message };
  }
  const QRMini = sandbox.window.QRMini || sandbox.QRMini;
  if (!QRMini || typeof QRMini.encode !== 'function') return { ok:false, reason:'no QRMini.encode exported' };

  let m;
  try { m = QRMini.encode('https://hartswf0.github.io/#join=abcdef0123456789&role=guest', 'M'); }
  catch (e) { return { ok:false, reason:'encode() threw: '+e.message }; }

  if (!Array.isArray(m) || m.length < 21) return { ok:false, reason:'matrix too small or not an array' };
  const n = m.length;
  if (m.some(row => !Array.isArray(row) || row.length !== n)) return { ok:false, reason:'matrix not square' };

  // Structural checks: finder patterns at 3 corners, and the timing pattern alternation.
  function finderOK(r0, c0){
    // outer 7x7 ring dark, inner 3x3 dark, the 1-module gap ring light
    for (let i=0;i<7;i++){
      if (!m[r0][c0+i] || !m[r0+6][c0+i] || !m[r0+i][c0] || !m[r0+i][c0+6]) return false; // outer ring
    }
    for (let r=2;r<=4;r++) for (let c=2;c<=4;c++) if (!m[r0+r][c0+c]) return false; // 3x3 core
    return true;
  }
  if (!finderOK(0,0)) return { ok:false, reason:'top-left finder pattern missing' };
  if (!finderOK(0,n-7)) return { ok:false, reason:'top-right finder pattern missing' };
  if (!finderOK(n-7,0)) return { ok:false, reason:'bottom-left finder pattern missing' };

  // Timing pattern: row 6 and col 6 between the finders must alternate.
  let alt = true;
  for (let c=8;c<n-8;c++){ const expect = (c % 2 === 0); if (m[6][c] !== expect) { alt = false; break; } }
  if (!alt) return { ok:false, reason:'horizontal timing pattern not alternating' };

  // Dark-module ratio sanity (real codes land roughly 40-60% dark).
  let dark=0; for (let r=0;r<n;r++) for (let c=0;c<n;c++) if (m[r][c]) dark++;
  const ratio = dark/(n*n);
  if (ratio < 0.30 || ratio > 0.70) return { ok:false, reason:'implausible dark ratio '+ratio.toFixed(2) };

  return { ok:true, size:n, ratio:ratio.toFixed(2) };
}

function splice(html, libSource, adapterSource, sourceName){
  const START = '/* QR-VENDOR-PLACEHOLDER */';
  const startIdx = html.indexOf(START);
  if (startIdx < 0) throw new Error('placeholder marker not found — is this the right file?');
  // Replace just the placeholder comment line with the vendored code.
  const banner = '/* vendored: '+sourceName+' — generated by build-qr.js, do not edit by hand */\n';
  const payload = banner + libSource.trim() + '\n' + adapterSource.trim();
  return html.replace(START, payload);
}

(async () => {
  if (!fs.existsSync(TARGET)) { console.error('Target not found:', TARGET); process.exit(1); }
  let html = fs.readFileSync(TARGET, 'utf8');
  if (html.indexOf('/* QR-VENDOR-PLACEHOLDER */') < 0) {
    if (html.indexOf('window.QRMini') >= 0 || html.indexOf('QRMini = {') >= 0) {
      console.error('It looks like a QR encoder is already vendored in this file. Aborting to avoid double-inlining.');
      console.error('To re-vendor, restore the placeholder block first.');
      process.exit(1);
    }
    console.error('Placeholder /* QR-VENDOR-PLACEHOLDER */ not found in', TARGET);
    process.exit(1);
  }

  let chosen = null;
  for (const src of SOURCES) {
    process.stdout.write('Fetching '+src.name+' ... ');
    let lib;
    try { lib = await fetchText(src.url); }
    catch (e) { console.log('failed ('+e.message+')'); continue; }
    console.log('ok ('+lib.length+' bytes)');

    process.stdout.write('  Validating ... ');
    const v = validate(lib, src.adapter);
    if (v.ok) { console.log('PASS (size '+v.size+', dark '+v.ratio+')'); chosen = { src, lib }; break; }
    console.log('FAIL ('+v.reason+')');
  }

  if (!chosen) { console.error('\nNo source produced a valid QR encoder. Nothing written.'); process.exit(1); }

  fs.writeFileSync(TARGET + '.bak', html);
  const out = splice(html, chosen.lib, chosen.src.adapter, chosen.src.name);
  fs.writeFileSync(TARGET, out);
  console.log('\nVendored '+chosen.src.name+' into '+path.basename(TARGET));
  console.log('Backup written to '+path.basename(TARGET)+'.bak');
  console.log('The shipped file now has a self-contained QR encoder (no runtime network needed).');
})();
