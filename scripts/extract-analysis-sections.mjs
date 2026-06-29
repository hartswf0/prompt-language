#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SECTION_NAMES = [
  'NON_OBVIOUS_INSIGHTS',
  'TENSIONS_CONTRADICTIONS',
  'SO_WHAT',
  'WHATS_MISSING',
];

const SECTION_SLUGS = {
  NON_OBVIOUS_INSIGHTS: 'non-obvious-insights',
  TENSIONS_CONTRADICTIONS: 'tensions-contradictions',
  SO_WHAT: 'so-what',
  WHATS_MISSING: 'whats-missing',
};

const ITEM_SECTIONS = new Set(['NON_OBVIOUS_INSIGHTS', 'TENSIONS_CONTRADICTIONS']);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const inputPath = path.resolve(repoRoot, process.argv[2] || 'ai-prompting-and-description.md');
const outputDir = path.resolve(repoRoot, process.argv[3] || 'analysis-sections');
const sourceRel = path.relative(repoRoot, inputPath).replaceAll(path.sep, '/');
const scriptRel = path.relative(repoRoot, fileURLToPath(import.meta.url)).replaceAll(path.sep, '/');

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const text = fs.readFileSync(inputPath, 'utf8');
const lines = text.split(/\r?\n/);

function pad(n, width = 3) {
  return String(n).padStart(width, '0');
}

function trimBlankEdges(value) {
  const parts = String(value).replace(/\s+$/g, '').split('\n');
  while (parts.length && parts[0].trim() === '') parts.shift();
  while (parts.length && parts[parts.length - 1].trim() === '') parts.pop();
  return parts.join('\n');
}

function markdownSafe(raw) {
  return trimBlankEdges(raw)
    .replace(/<strong>([\s\S]*?)<\/strong>/g, (_, inner) => `**${inner.trim()}**`)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function plainText(raw) {
  return trimBlankEdges(raw)
    .replace(/<strong>([\s\S]*?)<\/strong>/g, '$1')
    .replace(/<[^>\n]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

function responseDateAfter(lineIndex) {
  for (let i = lineIndex + 1; i < Math.min(lines.length, lineIndex + 6); i += 1) {
    const candidate = lines[i].trim();
    if (!candidate) continue;
    if (/^\d{1,2}\/\d{1,2}\/\d{4},\s+\d{1,2}:\d{2}:\d{2}\s+[AP]M$/.test(candidate)) {
      return candidate;
    }
    return null;
  }
  return null;
}

function parseUnits(section) {
  const isItemSection = ITEM_SECTIONS.has(section.name);
  const startRe = isItemSection ? /<item>/ : /<field name="([^"]+)">/;
  const endTag = isItemSection ? '</item>' : '</field>';
  const units = [];
  let current = null;

  for (let lineNo = section.startLine + 1; lineNo <= section.endLine - 1; lineNo += 1) {
    const line = lines[lineNo - 1] ?? '';

    if (!current) {
      const match = line.match(startRe);
      if (!match) continue;

      current = {
        kind: isItemSection ? 'item' : 'field',
        fieldName: isItemSection ? null : match[1],
        startLine: lineNo,
        bodyLines: [],
      };

      const afterStart = line.slice((match.index ?? 0) + match[0].length);
      const endIndex = afterStart.indexOf(endTag);
      if (endIndex >= 0) {
        current.bodyLines.push(afterStart.slice(0, endIndex));
        finishUnit(lineNo);
      } else if (afterStart.length) {
        current.bodyLines.push(afterStart);
      }
      continue;
    }

    const endIndex = line.indexOf(endTag);
    if (endIndex >= 0) {
      current.bodyLines.push(line.slice(0, endIndex));
      finishUnit(lineNo);
    } else {
      current.bodyLines.push(line);
    }
  }

  function finishUnit(endLine) {
    const raw = trimBlankEdges(current.bodyLines.join('\n'));
    const textValue = plainText(raw);
    const strong = raw.match(/<strong>([\s\S]*?)<\/strong>/);
    const title = strong ? plainText(strong[1]) : null;

    units.push({
      kind: current.kind,
      fieldName: current.fieldName,
      unitIndex: units.length + 1,
      startLine: current.startLine,
      endLine,
      title,
      raw,
      text: textValue,
      markdown: markdownSafe(raw),
    });
    current = null;
  }

  if (current) {
    const raw = trimBlankEdges(current.bodyLines.join('\n'));
    units.push({
      kind: current.kind,
      fieldName: current.fieldName,
      unitIndex: units.length + 1,
      startLine: current.startLine,
      endLine: section.endLine - 1,
      title: null,
      raw,
      text: plainText(raw),
      markdown: markdownSafe(raw),
      warning: 'unterminated unit before section close',
    });
  }

  return units;
}

const sections = [];
let currentResponse = null;
let responseCount = 0;

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  if (/^## Response:\s*$/.test(line)) {
    responseCount += 1;
    currentResponse = {
      index: responseCount,
      startLine: i + 1,
      date: responseDateAfter(i),
    };
    continue;
  }

  const sectionMatch = line.match(/<section name="([^"]+)">/);
  if (!sectionMatch || !SECTION_NAMES.includes(sectionMatch[1])) continue;

  const name = sectionMatch[1];
  const startLine = i + 1;
  let endLine = null;
  for (let j = i + 1; j < lines.length; j += 1) {
    if (lines[j].trim() === '</section>') {
      endLine = j + 1;
      break;
    }
  }
  if (!endLine) {
    console.warn(`Unclosed section ${name} at line ${startLine}; skipping.`);
    continue;
  }

  const section = {
    name,
    responseIndex: currentResponse?.index ?? null,
    responseDate: currentResponse?.date ?? null,
    responseStartLine: currentResponse?.startLine ?? null,
    startLine,
    endLine,
    raw: lines.slice(startLine - 1, endLine).join('\n'),
  };
  section.units = parseUnits(section).map((unit) => ({
    id: [
      `R${pad(section.responseIndex ?? 0)}`,
      SECTION_SLUGS[name].toUpperCase().replaceAll('-', '_'),
      unit.kind === 'field' ? unit.fieldName : `ITEM_${pad(unit.unitIndex, 2)}`,
      `L${unit.startLine}`,
    ].join('__'),
    sectionName: name,
    sectionSlug: SECTION_SLUGS[name],
    responseIndex: section.responseIndex,
    responseDate: section.responseDate,
    responseStartLine: section.responseStartLine,
    sectionStartLine: section.startLine,
    sectionEndLine: section.endLine,
    sourceFile: sourceRel,
    sourceLineStart: unit.startLine,
    sourceLineEnd: unit.endLine,
    sourceAnchor: `../${sourceRel}#L${unit.startLine}`,
    ...unit,
  }));

  sections.push(section);
  i = endLine - 1;
}

const entries = sections.flatMap((section) => section.units);
const bySection = Object.fromEntries(SECTION_NAMES.map((name) => [
  name,
  entries.filter((entry) => entry.sectionName === name),
]));

function writeMarkdownForSection(sectionName, sectionEntries) {
  const slug = SECTION_SLUGS[sectionName];
  const out = [];
  out.push(`# ${sectionName}`);
  out.push('');
  out.push(`Generated from \`${sourceRel}\` by \`${scriptRel}\`.`);
  out.push('');
  out.push(`Entries: ${sectionEntries.length}`);
  out.push('');

  for (const entry of sectionEntries) {
    const label = entry.kind === 'field' ? entry.fieldName : `item ${entry.unitIndex}`;
    const date = entry.responseDate ? ` · ${entry.responseDate}` : '';
    out.push(`## R${pad(entry.responseIndex ?? 0)}${date} · ${label}`);
    out.push('');
    out.push(`Source: [${sourceRel}:L${entry.sourceLineStart}](../${sourceRel}#L${entry.sourceLineStart})`);
    out.push('');
    out.push(`Trace: response ${entry.responseIndex ?? 'unknown'}, section lines ${entry.sectionStartLine}-${entry.sectionEndLine}, entry lines ${entry.sourceLineStart}-${entry.sourceLineEnd}`);
    out.push('');
    if (entry.title) {
      out.push(`Thesis: ${markdownSafe(entry.title)}`);
      out.push('');
    }
    out.push(entry.markdown || '_Empty entry._');
    out.push('');
  }

  fs.writeFileSync(path.join(outputDir, `${slug}.md`), `${out.join('\n')}\n`, 'utf8');
}

function writeIndex() {
  const out = [];
  out.push('# Analysis Sections Extract');
  out.push('');
  out.push(`Generated from \`${sourceRel}\`.`);
  out.push('');
  out.push('Run:');
  out.push('');
  out.push('```bash');
  out.push(`node ${scriptRel}`);
  out.push('```');
  out.push('');
  out.push('## Files');
  out.push('');
  for (const name of SECTION_NAMES) {
    const slug = SECTION_SLUGS[name];
    out.push(`- [${name}](./${slug}.md) — ${bySection[name].length} entries`);
  }
  out.push('- [sections.json](./sections.json) — machine-readable entries with response/date/line tracing');
  out.push('');
  out.push('## Trace fields');
  out.push('');
  out.push('Each extracted entry includes:');
  out.push('');
  out.push('- `responseIndex`');
  out.push('- `responseDate`');
  out.push('- `sectionName`');
  out.push('- `sectionStartLine` / `sectionEndLine`');
  out.push('- `sourceLineStart` / `sourceLineEnd`');
  out.push('- `sourceAnchor`');
  out.push('- raw text and cleaned text');
  out.push('');
  out.push('## Counts');
  out.push('');
  out.push(`- Responses seen: ${responseCount}`);
  out.push(`- Extracted sections: ${sections.length}`);
  out.push(`- Extracted entries: ${entries.length}`);
  for (const name of SECTION_NAMES) out.push(`- ${name}: ${bySection[name].length}`);
  out.push('');

  fs.writeFileSync(path.join(outputDir, 'README.md'), `${out.join('\n')}\n`, 'utf8');
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const name of SECTION_NAMES) {
  writeMarkdownForSection(name, bySection[name]);
}

const manifest = {
  metadata: {
    sourceFile: sourceRel,
    script: scriptRel,
    generatedAt: new Date().toISOString(),
    responsesSeen: responseCount,
    sectionsExtracted: sections.length,
    entriesExtracted: entries.length,
    countsBySection: Object.fromEntries(SECTION_NAMES.map((name) => [name, bySection[name].length])),
  },
  sections: sections.map((section) => ({
    name: section.name,
    responseIndex: section.responseIndex,
    responseDate: section.responseDate,
    responseStartLine: section.responseStartLine,
    startLine: section.startLine,
    endLine: section.endLine,
    entryIds: section.units.map((unit) => unit.id),
  })),
  entriesBySection: bySection,
};

fs.writeFileSync(path.join(outputDir, 'sections.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
writeIndex();

console.log(`Extracted ${entries.length} entries from ${sections.length} sections.`);
for (const name of SECTION_NAMES) {
  console.log(`${name}: ${bySection[name].length}`);
}
console.log(`Wrote ${path.relative(repoRoot, outputDir)}`);
