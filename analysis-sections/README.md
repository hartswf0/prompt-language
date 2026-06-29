# Analysis Sections Extract

Generated from `ai-prompting-and-description.md`.

Run:

```bash
node scripts/extract-analysis-sections.mjs
```

## Files

- [NON_OBVIOUS_INSIGHTS](./non-obvious-insights.md) — 915 entries
- [TENSIONS_CONTRADICTIONS](./tensions-contradictions.md) — 914 entries
- [SO_WHAT](./so-what.md) — 511 entries
- [WHATS_MISSING](./whats-missing.md) — 826 entries
- [sections.json](./sections.json) — machine-readable entries with response/date/line tracing

## Trace fields

Each extracted entry includes:

- `responseIndex`
- `responseDate`
- `sectionName`
- `sectionStartLine` / `sectionEndLine`
- `sourceLineStart` / `sourceLineEnd`
- `sourceAnchor`
- raw text and cleaned text

## Counts

- Responses seen: 159
- Extracted sections: 620
- Extracted entries: 3166
- NON_OBVIOUS_INSIGHTS: 915
- TENSIONS_CONTRADICTIONS: 914
- SO_WHAT: 511
- WHATS_MISSING: 826

