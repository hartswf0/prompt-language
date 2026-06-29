#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SECTION_ORDER = [
  'NON_OBVIOUS_INSIGHTS',
  'TENSIONS_CONTRADICTIONS',
  'SO_WHAT',
  'WHATS_MISSING',
];

const SECTION_LABELS = {
  NON_OBVIOUS_INSIGHTS: 'INSIGHT',
  TENSIONS_CONTRADICTIONS: 'TENSION',
  SO_WHAT: 'SO_WHAT',
  WHATS_MISSING: 'MISSING',
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const inputJson = path.resolve(repoRoot, process.argv[2] || 'analysis-sections/sections.json');
const outputDir = path.resolve(repoRoot, process.argv[3] || 'analysis-lines');
const inputRel = path.relative(repoRoot, inputJson).replaceAll(path.sep, '/');
const scriptRel = path.relative(repoRoot, fileURLToPath(import.meta.url)).replaceAll(path.sep, '/');

if (!fs.existsSync(inputJson)) {
  console.error(`Missing ${inputRel}. Run: node scripts/extract-analysis-sections.mjs`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(inputJson, 'utf8'));

function pad(n, width = 3) {
  return String(n).padStart(width, '0');
}

function collapse(raw) {
  return String(raw ?? '')
    .replace(/<strong>([\s\S]*?)<\/strong>/g, '$1')
    .replace(/<em>([\s\S]*?)<\/em>/g, '$1')
    .replace(/<\/?(?:item|field|section)\b[^>]*>/g, '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSentence(text) {
  const value = collapse(text);
  if (!value) return '';
  const direct = value.match(/^(.{32,260}?[.!?])(?:\s|$)/);
  if (direct) return direct[1].trim();
  if (value.length <= 220) return value;
  const soft = value.slice(0, 220);
  const cut = Math.max(
    soft.lastIndexOf(';'),
    soft.lastIndexOf(':'),
    soft.lastIndexOf(','),
    soft.lastIndexOf('—')
  );
  if (cut > 80) return `${soft.slice(0, cut).trim()}…`;
  return `${soft.trim()}…`;
}

function tokenEstimate(text) {
  const value = collapse(text);
  if (!value) return 0;
  return Math.max(1, Math.ceil(value.length / 4));
}

function tsvEscape(value) {
  return String(value ?? '')
    .replace(/\t/g, ' ')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function mdEscapePipes(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}

function csvLine(values) {
  return values.map((value) => {
    const s = String(value ?? '');
    return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  }).join(',');
}

const entries = SECTION_ORDER.flatMap((sectionName) => manifest.entriesBySection[sectionName] || []);

const rows = entries.map((entry, index) => {
  const full = collapse(entry.raw || entry.text || '');
  const kernel = collapse(entry.title || firstSentence(entry.raw || entry.text || ''));
  const source = `${manifest.metadata.sourceFile}:L${entry.sourceLineStart}`;
  const lineId = `L${pad(index + 1, 4)}`;
  const label = SECTION_LABELS[entry.sectionName] || entry.sectionName;
  const field = entry.fieldName || `item_${pad(entry.unitIndex, 2)}`;
  const visualSeed = `Visualize as one stark diagram: ${kernel}`;

  return {
    lineId,
    entryId: entry.id,
    section: entry.sectionName,
    label,
    field,
    response: entry.responseIndex,
    responseDate: entry.responseDate,
    source,
    sourceLineStart: entry.sourceLineStart,
    sourceLineEnd: entry.sourceLineEnd,
    sourceAnchor: entry.sourceAnchor,
    approxKernelTokens: tokenEstimate(kernel),
    approxFullTokens: tokenEstimate(full),
    kernel,
    full,
    visualSeed,
  };
});

function writeText(name, lines) {
  fs.writeFileSync(path.join(outputDir, name), `${lines.join('\n')}\n`, 'utf8');
}

function writeTsv(name, rowsForFile) {
  const header = [
    'line_id',
    'entry_id',
    'section',
    'field',
    'response',
    'response_date',
    'source',
    'kernel_tokens_est',
    'full_tokens_est',
    'kernel',
    'full',
  ];
  const lines = [header.join('\t')];
  for (const row of rowsForFile) {
    lines.push([
      row.lineId,
      row.entryId,
      row.section,
      row.field,
      row.response,
      row.responseDate,
      row.source,
      row.approxKernelTokens,
      row.approxFullTokens,
      row.kernel,
      row.full,
    ].map(tsvEscape).join('\t'));
  }
  writeText(name, lines);
}

function writeCsv(name, rowsForFile) {
  const header = [
    'line_id',
    'section',
    'field',
    'response',
    'source',
    'kernel_tokens_est',
    'full_tokens_est',
    'kernel',
  ];
  const lines = [csvLine(header)];
  for (const row of rowsForFile) {
    lines.push(csvLine([
      row.lineId,
      row.section,
      row.field,
      row.response,
      row.source,
      row.approxKernelTokens,
      row.approxFullTokens,
      row.kernel,
    ]));
  }
  writeText(name, lines);
}

function sectionRows(section) {
  return rows.filter((row) => row.section === section);
}

function fieldRows(section, field) {
  return rows.filter((row) => row.section === section && row.field === field);
}

function writeMarkdownLines(name, title, rowsForFile) {
  const out = [];
  out.push(`# ${title}`);
  out.push('');
  out.push(`Generated from \`${inputRel}\` by \`${scriptRel}\`.`);
  out.push('');
  out.push(`Rows: ${rowsForFile.length}`);
  out.push('');
  for (const row of rowsForFile) {
    out.push(`- \`${row.lineId}\` ${mdEscapePipes(row.kernel)}  _(${row.section}/${row.field}; ${row.source})_`);
  }
  writeText(name, out);
}

function writeVisualizationSeeds(rowsForFile) {
  const lines = ['line_id\tsection\tfield\tsource\tvisual_seed'];
  for (const row of rowsForFile) {
    lines.push([
      row.lineId,
      row.section,
      row.field,
      row.source,
      row.visualSeed,
    ].map(tsvEscape).join('\t'));
  }
  writeText('visualization-seeds.tsv', lines);
}

function writeCompressionReport() {
  const out = [];
  const allKernelTokens = rows.reduce((sum, row) => sum + row.approxKernelTokens, 0);
  const allFullTokens = rows.reduce((sum, row) => sum + row.approxFullTokens, 0);
  const ratio = allFullTokens ? (allKernelTokens / allFullTokens) : 0;

  out.push('# Compression Report');
  out.push('');
  out.push('Token counts are rough local estimates using `ceil(characters / 4)`. They are for comparison, not billing.');
  out.push('');
  out.push('| Set | Rows | Kernel tokens est. | Full tokens est. | Kernel / Full |');
  out.push('|---|---:|---:|---:|---:|');

  const sets = [
    ['ALL', rows],
    ['NON_OBVIOUS_INSIGHTS', sectionRows('NON_OBVIOUS_INSIGHTS')],
    ['TENSIONS_CONTRADICTIONS', sectionRows('TENSIONS_CONTRADICTIONS')],
    ['SO_WHAT', sectionRows('SO_WHAT')],
    ['SO_WHAT/Core_Implication', fieldRows('SO_WHAT', 'Core_Implication')],
    ['SO_WHAT/Why_It_Matters', fieldRows('SO_WHAT', 'Why_It_Matters')],
    ['WHATS_MISSING', sectionRows('WHATS_MISSING')],
    ['WHATS_MISSING/Missing_Question', fieldRows('WHATS_MISSING', 'Missing_Question')],
    ['WHATS_MISSING/Next_Inquiry', fieldRows('WHATS_MISSING', 'Next_Inquiry')],
  ];

  for (const [name, setRows] of sets) {
    const kt = setRows.reduce((sum, row) => sum + row.approxKernelTokens, 0);
    const ft = setRows.reduce((sum, row) => sum + row.approxFullTokens, 0);
    out.push(`| ${name} | ${setRows.length} | ${kt} | ${ft} | ${ft ? (kt / ft).toFixed(2) : '0.00'} |`);
  }

  out.push('');
  out.push('## Interpretation');
  out.push('');
  out.push('- `kernel` is the shortest useful writing line: usually the `<strong>` thesis, otherwise the first sentence.');
  out.push('- `full` is the one-line version of the complete extracted item/field.');
  out.push('- Use `*.kernels.txt` when you want the least-token idea stream.');
  out.push('- Use `all-lines.tsv` or `lines.json` when you need traceability and full text.');
  out.push('- Use `index.html` when you want to search/filter/copy individual lines.');

  writeText('compression-report.md', out);
}

function writeReadme() {
  const out = [];
  out.push('# Analysis Lines');
  out.push('');
  out.push('One-line extracted writing units from the analysis sections.');
  out.push('');
  out.push('Run:');
  out.push('');
  out.push('```bash');
  out.push('node scripts/build-analysis-lines.mjs');
  out.push('```');
  out.push('');
  out.push('## Copy/read files');
  out.push('');
  out.push('- [index.html](./index.html) — browser UI for search, filter, and copy');
  out.push('- [all-kernels.txt](./all-kernels.txt) — least-token idea stream, one kernel per line');
  out.push('- [all-lines.tsv](./all-lines.tsv) — traceable one-line kernels and full text');
  out.push('- [all-lines.csv](./all-lines.csv) — spreadsheet-friendly kernels');
  out.push('- [non-obvious-insights.kernels.txt](./non-obvious-insights.kernels.txt)');
  out.push('- [so-what-core.kernels.txt](./so-what-core.kernels.txt)');
  out.push('- [so-what.kernels.txt](./so-what.kernels.txt)');
  out.push('- [whats-missing-questions.kernels.txt](./whats-missing-questions.kernels.txt)');
  out.push('- [visualization-seeds.tsv](./visualization-seeds.tsv) — one visualization prompt per line');
  out.push('- [compression-report.md](./compression-report.md)');
  out.push('- [lines.json](./lines.json) — compact machine-readable rows');
  out.push('');
  out.push('## Rows');
  out.push('');
  out.push(`- Total rows: ${rows.length}`);
  for (const section of SECTION_ORDER) out.push(`- ${section}: ${sectionRows(section).length}`);
  out.push('');
  out.push('## Fields');
  out.push('');
  out.push('Each row keeps: `lineId`, original `entryId`, section, field, response/date, source line, token estimates, kernel, full text, and visualization seed.');

  writeText('README.md', out);
}

function writeHtml() {
  const compactRows = rows.map((row) => ({
    id: row.lineId,
    entryId: row.entryId,
    section: row.section,
    label: row.label,
    field: row.field,
    response: row.response,
    date: row.responseDate,
    source: row.source,
    kTok: row.approxKernelTokens,
    fTok: row.approxFullTokens,
    kernel: row.kernel,
    full: row.full,
    visual: row.visualSeed,
  }));
  const rowsJson = JSON.stringify(compactRows)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Analysis Lines</title>
<style>
:root{--k:#000;--w:#fff;--g:#e8e8e8;--y:#ffe100}
*{box-sizing:border-box}
body{margin:0;background:var(--w);color:var(--k);font:14px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
header{position:sticky;top:0;z-index:4;background:var(--k);color:var(--w);border-bottom:4px solid var(--k);padding:8px}
h1{font-size:16px;margin:0 0 6px;text-transform:uppercase;letter-spacing:.05em}
.bar{display:flex;gap:6px;align-items:center;overflow-x:auto;padding-bottom:2px}
button,input,select{font:inherit;border:3px solid var(--k);background:var(--w);color:var(--k);border-radius:0;padding:7px 9px;min-height:36px}
header button,header input,header select{border-color:var(--w)}
button.active{background:var(--y)}
input{min-width:220px;flex:1 1 auto}
main{padding:8px}
.stats{font-size:11px;opacity:.75;margin:6px 0 0}
.row{display:grid;grid-template-columns:86px 118px 1fr auto;gap:6px;align-items:stretch;border:3px solid var(--k);margin-bottom:6px;background:var(--w)}
.meta{background:var(--k);color:var(--w);padding:7px;font-size:11px}
.kind{padding:7px;border-right:3px solid var(--k);font-size:11px;font-weight:900;text-transform:uppercase;word-break:break-word}
.line{padding:7px;white-space:normal}
.src{display:block;font-size:10px;opacity:.65;margin-top:5px}
.actions{display:flex;gap:4px;padding:4px;border-left:3px solid var(--k);align-items:center}
.actions button{min-width:54px}
.full .line .kernel{display:none}
.line .fulltext{display:none}
.full .line .fulltext{display:inline}
.copied{outline:4px solid var(--y)}
@media(max-width:680px){
  .row{grid-template-columns:1fr}
  .kind,.actions{border:0;border-top:3px solid var(--k)}
  .actions{justify-content:stretch}
  .actions button{flex:1 1 auto}
}
</style>
</head>
<body>
<header>
  <h1>Analysis Lines</h1>
  <div class="bar">
    <input id="q" placeholder="search line / source / field">
    <select id="section">
      <option value="">ALL</option>
      <option>NON_OBVIOUS_INSIGHTS</option>
      <option>TENSIONS_CONTRADICTIONS</option>
      <option>SO_WHAT</option>
      <option>WHATS_MISSING</option>
    </select>
    <select id="field">
      <option value="">ANY FIELD</option>
      <option>Core_Implication</option>
      <option>Why_It_Matters</option>
      <option>Missing_Question</option>
      <option>Critical_Assumption</option>
      <option>Next_Inquiry</option>
    </select>
    <button id="mode">Kernel</button>
    <button id="copyVisible">Copy visible</button>
  </div>
  <div class="stats" id="stats"></div>
</header>
<main id="list"></main>
<script>
const ROWS=${rowsJson};
const state={q:'',section:'',field:'',full:false};
const list=document.getElementById('list');
const stats=document.getElementById('stats');
const q=document.getElementById('q');
const section=document.getElementById('section');
const field=document.getElementById('field');
const mode=document.getElementById('mode');
function esc(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function filtered(){
  const needle=state.q.toLowerCase();
  return ROWS.filter(r=>{
    if(state.section && r.section!==state.section)return false;
    if(state.field && r.field!==state.field)return false;
    if(!needle)return true;
    return [r.kernel,r.full,r.section,r.field,r.source,r.id].join(' ').toLowerCase().includes(needle);
  });
}
function render(){
  const rows=filtered();
  document.body.classList.toggle('full',state.full);
  mode.textContent=state.full?'Full':'Kernel';
  stats.textContent=rows.length+' visible / '+ROWS.length+' total · '+rows.reduce((s,r)=>s+(state.full?r.fTok:r.kTok),0)+' token est.';
  list.innerHTML=rows.slice(0,800).map(r=>'<article class="row" data-id="'+esc(r.id)+'"><div class="meta">'+esc(r.id)+'<br>R'+String(r.response).padStart(3,'0')+'<br>'+esc(r.kTok)+'/'+esc(r.fTok)+' tok</div><div class="kind">'+esc(r.label)+'<br>'+esc(r.field)+'</div><div class="line"><span class="kernel">'+esc(r.kernel)+'</span><span class="fulltext">'+esc(r.full)+'</span><span class="src">'+esc(r.source)+'</span></div><div class="actions"><button data-copy="kernel">Kernel</button><button data-copy="full">Full</button><button data-copy="visual">Visual</button></div></article>').join('');
  if(rows.length>800) list.insertAdjacentHTML('beforeend','<p>Showing first 800. Narrow the search to see more.</p>');
}
async function copyText(text, el){
  try{await navigator.clipboard.writeText(text);}catch(e){
    const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();
  }
  if(el){el.classList.add('copied');setTimeout(()=>el.classList.remove('copied'),500);}
}
q.addEventListener('input',()=>{state.q=q.value;render();});
section.addEventListener('change',()=>{state.section=section.value;render();});
field.addEventListener('change',()=>{state.field=field.value;render();});
mode.addEventListener('click',()=>{state.full=!state.full;render();});
document.getElementById('copyVisible').addEventListener('click',e=>{
  const rows=filtered();
  copyText(rows.map(r=>state.full?r.full:r.kernel).join('\\n'),e.currentTarget);
});
list.addEventListener('click',e=>{
  const btn=e.target.closest('button[data-copy]');
  if(!btn)return;
  const row=ROWS.find(r=>r.id===btn.closest('.row').dataset.id);
  copyText(row[btn.dataset.copy],btn);
});
render();
</script>
</body>
</html>`;
  fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

writeTsv('all-lines.tsv', rows);
writeCsv('all-lines.csv', rows);
writeText('all-kernels.txt', rows.map((row) => row.kernel));
writeMarkdownLines('all-kernels.md', 'All Kernels', rows);

for (const section of SECTION_ORDER) {
  const setRows = sectionRows(section);
  const slug = section.toLowerCase().replaceAll('_', '-');
  writeTsv(`${slug}.lines.tsv`, setRows);
  writeText(`${slug}.kernels.txt`, setRows.map((row) => row.kernel));
  writeMarkdownLines(`${slug}.kernels.md`, section, setRows);
}

writeText('so-what-core.kernels.txt', fieldRows('SO_WHAT', 'Core_Implication').map((row) => row.kernel));
writeText('so-what-why-it-matters.kernels.txt', fieldRows('SO_WHAT', 'Why_It_Matters').map((row) => row.kernel));
writeText('whats-missing-questions.kernels.txt', fieldRows('WHATS_MISSING', 'Missing_Question').map((row) => row.kernel));
writeText('whats-missing-next-inquiry.kernels.txt', fieldRows('WHATS_MISSING', 'Next_Inquiry').map((row) => row.kernel));
writeVisualizationSeeds(rows);
writeCompressionReport();
writeReadme();
writeHtml();
fs.writeFileSync(path.join(outputDir, 'lines.json'), `${JSON.stringify({
  metadata: {
    source: inputRel,
    script: scriptRel,
    generatedAt: new Date().toISOString(),
    rows: rows.length,
  },
  rows,
}, null, 2)}\n`, 'utf8');

console.log(`Built ${rows.length} one-line analysis rows.`);
console.log(`Wrote ${path.relative(repoRoot, outputDir)}`);
