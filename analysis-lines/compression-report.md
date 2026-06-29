# Compression Report

Token counts are rough local estimates using `ceil(characters / 4)`. They are for comparison, not billing.

| Set | Rows | Kernel tokens est. | Full tokens est. | Kernel / Full |
|---|---:|---:|---:|---:|
| ALL | 3166 | 97517 | 250275 | 0.39 |
| NON_OBVIOUS_INSIGHTS | 915 | 19053 | 86380 | 0.22 |
| TENSIONS_CONTRADICTIONS | 914 | 32719 | 66176 | 0.49 |
| SO_WHAT | 511 | 15072 | 38584 | 0.39 |
| SO_WHAT/Core_Implication | 155 | 4881 | 11062 | 0.44 |
| SO_WHAT/Why_It_Matters | 128 | 4140 | 11271 | 0.37 |
| WHATS_MISSING | 826 | 30673 | 59135 | 0.52 |
| WHATS_MISSING/Missing_Question | 153 | 6623 | 6744 | 0.98 |
| WHATS_MISSING/Next_Inquiry | 155 | 5435 | 20390 | 0.27 |

## Interpretation

- `kernel` is the shortest useful writing line: usually the `<strong>` thesis, otherwise the first sentence.
- `full` is the one-line version of the complete extracted item/field.
- Use `*.kernels.txt` when you want the least-token idea stream.
- Use `all-lines.tsv` or `lines.json` when you need traceability and full text.
- Use `index.html` when you want to search/filter/copy individual lines.
