#!/usr/bin/env python3
"""
Build LOCUS/locus-export.json from the public LocalLaws/LOCUS-v1 dataset.

The browser map cannot safely load the full 2.21M-row corpus. This importer
uses Hugging Face's datasets-server rows API to collect a spread sample of real
LOCUS rows, groups them by jurisdiction, and writes the JSON schema expected by
locus-map.html.

For local research work, install `datasets` separately and query the full corpus
directly. This script is intentionally dependency-light so the map can be
refreshed without a full 1.7GB Parquet download.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import math
import random
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import OrderedDict
from pathlib import Path


DATASET = "LocalLaws/LOCUS-v1"
CONFIG = "default"
SPLIT = "train"
ROWS_API = "https://datasets-server.huggingface.co/rows"
DATASET_API = "https://huggingface.co/api/datasets/LocalLaws/LOCUS-v1"


STATE_COORDS = {
    # CONUS map coordinates use approximate state centroids. LOCUS-v1 does not
    # ship lat/lng. A later geocoder can replace these without changing schema.
    "al": (32.8, -86.8), "az": (34.2, -111.6), "ar": (34.8, -92.4),
    "ca": (37.2, -119.4), "co": (39.0, -105.5), "ct": (41.6, -72.7),
    "de": (39.0, -75.5), "fl": (28.3, -81.7), "ga": (32.7, -83.5),
    "id": (44.4, -114.6), "il": (40.0, -89.2), "in": (40.0, -86.3),
    "ia": (42.0, -93.5), "ks": (38.5, -98.3), "ky": (37.5, -85.3),
    "la": (31.0, -92.0), "me": (45.4, -69.2), "md": (39.0, -76.8),
    "ma": (42.3, -71.8), "mi": (44.3, -84.7), "mn": (46.3, -94.3),
    "ms": (32.7, -89.7), "mo": (38.4, -92.5), "mt": (47.0, -109.6),
    "ne": (41.5, -99.8), "nv": (39.3, -116.9), "nh": (43.7, -71.6),
    "nj": (40.1, -74.5), "nm": (34.4, -106.0), "ny": (42.9, -75.5),
    "nc": (35.6, -79.4), "nd": (47.5, -100.5), "oh": (40.3, -82.8),
    "ok": (35.5, -97.5), "or": (43.9, -120.5), "pa": (40.9, -77.7),
    "ri": (41.7, -71.5), "sc": (33.9, -80.9), "sd": (44.4, -100.3),
    "tn": (35.8, -86.4), "tx": (31.4, -99.3), "ut": (39.3, -111.6),
    "vt": (44.0, -72.7), "va": (37.6, -78.7), "wa": (47.4, -120.4),
    "wv": (38.6, -80.6), "wi": (44.6, -89.9), "wy": (43.0, -107.5),
    "dc": (38.9, -77.0),
}

CITY_COORDS = {
    # A small hand-maintained set for recognizable anchors in the sample export.
    "newyork-ny": (40.713, -74.006), "losangeles-ca": (34.052, -118.244),
    "chicago-il": (41.878, -87.630), "houston-tx": (29.760, -95.369),
    "phoenix-az": (33.448, -112.074), "philadelphia-pa": (39.952, -75.165),
    "sanantonio-tx": (29.424, -98.494), "sandiego-ca": (32.715, -117.161),
    "dallas-tx": (32.777, -96.797), "austin-tx": (30.267, -97.743),
    "jacksonville-fl": (30.332, -81.656), "fortworth-tx": (32.755, -97.330),
    "columbus-oh": (39.961, -82.999), "charlotte-nc": (35.227, -80.843),
    "indianapolis-in": (39.768, -86.158), "sanfrancisco-ca": (37.775, -122.419),
    "seattle-wa": (47.606, -122.332), "denver-co": (39.739, -104.990),
    "washington-dc": (38.907, -77.037), "boston-ma": (42.360, -71.058),
    "nashville-tn": (36.163, -86.781), "detroit-mi": (42.331, -83.046),
    "portland-or": (45.515, -122.679), "lasvegas-nv": (36.170, -115.140),
    "memphis-tn": (35.150, -90.049), "louisville-ky": (38.252, -85.758),
    "baltimore-md": (39.290, -76.612), "milwaukee-wi": (43.038, -87.907),
    "albuquerque-nm": (35.084, -106.650), "tucson-az": (32.222, -110.974),
    "fresno-ca": (36.738, -119.787), "sacramento-ca": (38.581, -121.494),
    "atlanta-ga": (33.749, -84.388), "miami-fl": (25.762, -80.192),
    "tampa-fl": (27.951, -82.457), "orlando-fl": (28.538, -81.379),
    "minneapolis-mn": (44.978, -93.265), "stpaul-mn": (44.953, -93.090),
    "cleveland-oh": (41.499, -81.694), "cincinnati-oh": (39.103, -84.512),
    "pittsburgh-pa": (40.440, -79.996), "stlouis-mo": (38.627, -90.199),
    "kansascity-mo": (39.099, -94.578), "omaha-ne": (41.256, -95.934),
    "raleigh-nc": (35.779, -78.638), "richmond-va": (37.540, -77.436),
    "savannah-ga": (32.081, -81.091), "neworleans-la": (29.951, -90.072),
}


def request_json(url: str, timeout: int = 60) -> dict:
    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "PromptLanguageLOCUS/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_rows(offset: int, length: int, retries: int = 6) -> dict:
    query = urllib.parse.urlencode(
        {
            "dataset": DATASET,
            "config": CONFIG,
            "split": SPLIT,
            "offset": offset,
            "length": length,
        }
    )
    url = f"{ROWS_API}?{query}"
    for attempt in range(retries):
        try:
            return request_json(url)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
            if attempt == retries - 1:
                raise
            retry_after = None
            if isinstance(exc, urllib.error.HTTPError):
                retry_after = exc.headers.get("Retry-After")
            try:
                wait = float(retry_after) if retry_after else 2.5 * (attempt + 1)
            except ValueError:
                wait = 2.5 * (attempt + 1)
            print(f"rows offset={offset} failed ({exc}); retrying in {wait:.1f}s", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError("unreachable")


def slug(value: str | None) -> str:
    value = (value or "").strip().lower()
    return re.sub(r"[^a-z0-9]+", "", value)


def title_place(value: str | None) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    # LOCUS city values are often compact slugs like "kingcove".
    known = {
        "st": "St.",
        "saint": "Saint",
        "mt": "Mt.",
    }
    parts = re.split(r"[_\-\s]+", value)
    if len(parts) > 1:
        return " ".join(known.get(part.lower(), part.capitalize()) for part in parts if part)
    # Best-effort compact slug presentation.
    return value.replace("_", " ").replace("-", " ").title()


def sigmoid(value: float | None) -> float:
    if value is None:
        return 0.5
    try:
        value = float(value)
    except (TypeError, ValueError):
        return 0.5
    return round(1 / (1 + math.exp(-value)), 4)


def score_pair(row: dict, key: str) -> list[float]:
    return [sigmoid(row.get(key)), 0.0]


def code_from_header(header: str | None, state: str, city: str, county: str | None, row_idx: int) -> str:
    header = (header or "").strip()
    header = re.sub(r"^#+\\s*", "", header)
    header = re.sub(r"\\s+", " ", header)
    if header:
        return header[:120]
    place = city or county or "LOCUS"
    return f"{place.title()}, {state.upper()} · row {row_idx}"


def provision_from_row(row_wrapper: dict) -> dict | None:
    row = row_wrapper.get("row") or {}
    text = (row.get("content") or "").strip()
    if not text:
        return None
    function = row.get("function") or "—"
    topic = row.get("topic") or ("Other" if row.get("is_substantive") else "Non-substantive")
    return {
        "code": code_from_header(row.get("header"), row.get("state") or "", row.get("city") or "", row.get("county"), row_wrapper.get("row_idx", 0)),
        "stratum": "derived",
        "text": text,
        "function": function,
        "function_verified": False,
        "topic": topic,
        "topic_verified": False,
        "mislabel_note": None,
        "scores": {
            "opacity": score_pair(row, "opacity"),
            "paternalism": score_pair(row, "paternalism"),
            "discretion": score_pair(row, "enforcement_discretion"),
            "salience": score_pair(row, "problem_salience"),
        },
    }


def jittered_state_coord(state: str, place_key: str) -> tuple[float, float]:
    lat, lng = STATE_COORDS.get(state.lower(), (39.5, -98.35))
    digest = hashlib.sha256(place_key.encode("utf-8")).digest()
    # Stable jitter keeps multiple jurisdictions in the same state visible.
    dx = (digest[0] / 255 - 0.5) * 3.2
    dy = (digest[1] / 255 - 0.5) * 2.2
    return round(lat + dy, 4), round(lng + dx, 4)


def place_coord(city: str, state: str, place_key: str) -> tuple[float, float]:
    coord = CITY_COORDS.get(f"{slug(city)}-{state.lower()}")
    if coord:
        return coord
    return jittered_state_coord(state, place_key)


def is_mappable_place(city: str, state: str) -> bool:
    state = state.lower()
    return state in STATE_COORDS or f"{slug(city)}-{state}" in CITY_COORDS


def build_export(rows: list[dict], source_meta: dict, max_places: int, max_per_place: int) -> dict:
    places: OrderedDict[str, dict] = OrderedDict()
    for wrapped in rows:
        row = wrapped.get("row") or {}
        state = (row.get("state") or "").lower().strip()
        city = (row.get("city") or "").strip()
        county = (row.get("county") or "").strip()
        if not state:
            continue
        place_raw = city or county or f"unknown-{state}"
        if not is_mappable_place(place_raw, state):
            continue
        place_id = f"{slug(place_raw)}-{state}"
        if place_id not in places:
            if len(places) >= max_places:
                continue
            lat, lng = place_coord(place_raw, state, place_id)
            places[place_id] = {
                "id": place_id,
                "city": title_place(place_raw),
                "state": state.upper(),
                "lat": lat,
                "lng": lng,
                "provenance_present": 5,
                "source_jurisdiction_type": row.get("source_jurisdiction_type"),
                "provisions": [],
            }
        provisions = places[place_id]["provisions"]
        if len(provisions) >= max_per_place:
            continue
        provision = provision_from_row(wrapped)
        if provision:
            provisions.append(provision)

    places_list = [p for p in places.values() if p["provisions"]]
    total_provisions = sum(len(p["provisions"]) for p in places_list)
    card = source_meta.get("cardData") or {}
    return {
        "meta": {
            "name": "LOCUS real export",
            "source": DATASET,
            "snapshot": dt.datetime.now(dt.UTC).date().isoformat(),
            "dataset_sha": source_meta.get("sha"),
            "dataset_last_modified": source_meta.get("lastModified"),
            "license": card.get("license") or "cc-by-nc-4.0",
            "rows_total": None,
            "rows_sampled": len(rows),
            "places": len(places_list),
            "provisions": total_provisions,
            "coordinate_note": "LOCUS-v1 does not include lat/lng; this export uses known city coordinates when available and stable state-centroid jitter otherwise.",
            "score_note": "LOCUS scalar model scores are normalized with a logistic transform for 0..1 UI display; r=0 marks that no GPT correlation coefficient is supplied by LOCUS-v1.",
        },
        "places": places_list,
    }


def collect_rows(total_rows: int, pages: int, page_size: int, sleep_s: float) -> list[dict]:
    if total_rows <= page_size:
        offsets = [0]
    else:
        pages = max(1, pages)
        stride = max(1, (total_rows - page_size) // pages)
        offsets = [min(total_rows - page_size, i * stride) for i in range(pages)]
    seen = set()
    rows: list[dict] = []
    for idx, offset in enumerate(offsets, 1):
        data = fetch_rows(offset, page_size)
        for wrapped in data.get("rows") or []:
            row_idx = wrapped.get("row_idx")
            if row_idx in seen:
                continue
            seen.add(row_idx)
            rows.append(wrapped)
        print(f"fetched page {idx}/{len(offsets)} offset={offset} rows={len(data.get('rows') or [])}", file=sys.stderr)
        if sleep_s > 0 and idx < len(offsets):
            time.sleep(sleep_s)
    # Shuffle before place limiting so early offsets do not dominate the export.
    random.Random(20260624).shuffle(rows)
    return rows


def collect_parquet_rows(paths: list[Path], max_places: int, max_per_place: int) -> tuple[list[dict], int]:
    try:
        import pyarrow.parquet as pq
    except ImportError as exc:
        raise RuntimeError("Parquet mode requires pyarrow. Install with: python -m pip install pyarrow") from exc

    columns = [
        "header", "content", "is_substantive", "function", "topic",
        "source_jurisdiction_type", "state", "city", "county",
        "enforcement_discretion", "opacity", "paternalism", "problem_salience",
    ]
    selected: list[dict] = []
    place_counts: dict[str, int] = {}
    total_rows = 0

    for path in paths:
        pf = pq.ParquetFile(path)
        total_rows += pf.metadata.num_rows
        for rg in range(pf.num_row_groups):
            table = pf.read_row_group(rg, columns=columns)
            batch = table.to_pylist()
            print(f"read {path.name} row_group={rg + 1}/{pf.num_row_groups} rows={len(batch)}", file=sys.stderr)
            for local_idx, row in enumerate(batch):
                state = (row.get("state") or "").lower().strip()
                place_raw = (row.get("city") or row.get("county") or "").strip()
                if not state or not place_raw:
                    continue
                if not is_mappable_place(place_raw, state):
                    continue
                place_id = f"{slug(place_raw)}-{state}"
                if place_id not in place_counts:
                    if len(place_counts) >= max_places:
                        continue
                    place_counts[place_id] = 0
                if place_counts[place_id] >= max_per_place:
                    continue
                place_counts[place_id] += 1
                selected.append({"row_idx": len(selected), "row": row})

    random.Random(20260624).shuffle(selected)
    return selected, total_rows


def main() -> int:
    here = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Build LOCUS map export from LocalLaws/LOCUS-v1.")
    parser.add_argument("--out", type=Path, default=here / "locus-export.json")
    parser.add_argument("--pages", type=int, default=90, help="number of spread pages to request from HF rows API")
    parser.add_argument("--page-size", type=int, default=100, help="rows per HF rows API page")
    parser.add_argument("--sleep", type=float, default=0.35, help="seconds to wait between HF rows API pages")
    parser.add_argument("--parquet", type=Path, action="append", default=[], help="local LOCUS parquet shard; may be repeated")
    parser.add_argument("--max-places", type=int, default=260)
    parser.add_argument("--max-per-place", type=int, default=8)
    parser.add_argument("--indent", type=int, default=2)
    args = parser.parse_args()

    source_meta = request_json(DATASET_API)
    if args.parquet:
        rows, sampled_total = collect_parquet_rows(args.parquet, args.max_places, args.max_per_place)
        # Keep the card-level total when available; record the shard total too.
        total_rows = int((source_meta.get("cardData") or {}).get("dataset_info", {}).get("splits", [{}])[0].get("num_examples") or sampled_total)
    else:
        first = fetch_rows(0, 1)
        total_rows = int(first.get("num_rows_total") or 0)
        if not total_rows:
            raise RuntimeError("Could not determine total dataset row count")
        sampled_total = total_rows
        rows = collect_rows(total_rows, args.pages, args.page_size, args.sleep)
    export = build_export(rows, source_meta, args.max_places, args.max_per_place)
    export["meta"]["rows_total"] = total_rows
    if args.parquet:
        export["meta"]["parquet_rows_scanned"] = sampled_total
        export["meta"]["parquet_files"] = [str(path) for path in args.parquet]

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(export, ensure_ascii=False, indent=args.indent) + "\n", encoding="utf-8")
    print(
        f"wrote {args.out} · {export['meta']['places']} places · "
        f"{export['meta']['provisions']} provisions · sampled {len(rows)} of {total_rows} rows"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
