# LOCUS map

This folder contains a browser map for a compact export of the public
[`LocalLaws/LOCUS-v1`](https://huggingface.co/datasets/LocalLaws/LOCUS-v1)
dataset.

`locus-export.json` is real LOCUS data in the schema consumed by
`locus-map.html`. It is intentionally browser-sized; the full LOCUS-v1 corpus is
2,211,516 rows and is stored on Hugging Face as eight Parquet shards.

## Current export

- Source dataset: `LocalLaws/LOCUS-v1`
- Source snapshot SHA: recorded in `locus-export.json.meta.dataset_sha`
- Source shard used locally: `data/train-00000-of-00008.parquet`
- Export size: 181 places / 1,437 provisions
- States in the current export: AL, AR, AZ, CA, CO

LOCUS-v1 does not include latitude/longitude. The importer uses known city
coordinates when available and stable state-centroid jitter otherwise so that
the map can render jurisdictions without inventing legal data.

## Refresh the export

Create a local virtual environment and install the Parquet dependency:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install pyarrow
```

Download one or more LOCUS Parquet shards into ignored local storage:

```bash
mkdir -p data/raw
curl -L -o data/raw/train-00000-of-00008.parquet \
  https://huggingface.co/datasets/LocalLaws/LOCUS-v1/resolve/main/data/train-00000-of-00008.parquet
```

Build the browser export:

```bash
.venv/bin/python scripts/build_locus_export.py \
  --parquet data/raw/train-00000-of-00008.parquet \
  --max-places 220 \
  --max-per-place 8
```

You can repeat `--parquet` for more shards if you want broader coverage. Raw
Parquet files are ignored by git.

## Run locally

Serve the folder so the browser can fetch `locus-export.json`:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/LOCUS/locus-map.html
```

## Caveats

The dataset card states that LOCUS is not exhaustive, labels are model-assigned
and not fully human-validated, local law changes over time, and the dataset is
not legal advice. Keep those caveats visible in any downstream product.
