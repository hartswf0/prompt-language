# Analysis Lines

One-line extracted writing units from the analysis sections.

Run:

```bash
node scripts/build-analysis-lines.mjs
```

## Copy/read files

- [index.html](./index.html) — browser UI for search, filter, and copy
- [all-kernels.txt](./all-kernels.txt) — least-token idea stream, one kernel per line
- [all-lines.tsv](./all-lines.tsv) — traceable one-line kernels and full text
- [all-lines.csv](./all-lines.csv) — spreadsheet-friendly kernels
- [non-obvious-insights.kernels.txt](./non-obvious-insights.kernels.txt)
- [so-what-core.kernels.txt](./so-what-core.kernels.txt)
- [so-what.kernels.txt](./so-what.kernels.txt)
- [whats-missing-questions.kernels.txt](./whats-missing-questions.kernels.txt)
- [visualization-seeds.tsv](./visualization-seeds.tsv) — one visualization prompt per line
- [compression-report.md](./compression-report.md)
- [lines.json](./lines.json) — compact machine-readable rows

## Rows

- Total rows: 3166
- NON_OBVIOUS_INSIGHTS: 915
- TENSIONS_CONTRADICTIONS: 914
- SO_WHAT: 511
- WHATS_MISSING: 826

## Fields

Each row keeps: `lineId`, original `entryId`, section, field, response/date, source line, token estimates, kernel, full text, and visualization seed.
