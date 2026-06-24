#!/usr/bin/env python3
"""
fetch_fuel.py — build real StatsBomb fuel for FMAS22 tuning.

The single-match fetcher proves the pipe. This one gathers many public
StatsBomb event/360 matches, converts them into one canonical corpus, and
writes an aggregate calibration file.

Usage:
  python3 fetch_fuel.py --statsbomb --limit 120
"""
from __future__ import annotations

import argparse
import json
import os
import ssl
import sys
import re
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from canonical import Match
from calibrate import calibrate
from statsbomb import convert_file

CACHE = os.path.join(HERE, "_cache")
SB = "https://raw.githubusercontent.com/statsbomb/open-data/master/data"


def get_json(url: str, dest: str):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        with open(dest) as f:
            return json.load(f)
    print(f"  downloading {os.path.basename(dest)}")
    req = urllib.request.Request(url, headers={"User-Agent": "FMAS22 fuel fetcher"})
    with urllib.request.urlopen(req, timeout=60, context=ssl.create_default_context()) as r:
        data = r.read()
    with open(dest, "wb") as f:
        f.write(data)
    return json.loads(data.decode("utf-8"))


def match_sort_key(row):
    return (
        row.get("match_date") or "",
        row.get("kick_off") or "",
        row.get("match_id") or 0,
    )


def collect_statsbomb(limit: int):
    comps = get_json(f"{SB}/competitions.json", os.path.join(CACHE, "competitions.json"))
    comps = [c for c in comps if c.get("match_available_360")]
    selected = []
    for comp in comps:
        cid, sid = comp["competition_id"], comp["season_id"]
        match_path = os.path.join(CACHE, "matches", f"{cid}_{sid}.json")
        try:
            matches = get_json(f"{SB}/matches/{cid}/{sid}.json", match_path)
        except Exception as e:
            print(f"  skip matches {cid}/{sid}: {e}")
            continue
        for match in sorted(matches, key=match_sort_key):
            selected.append({
                "competition_id": cid,
                "season_id": sid,
                "competition": comp.get("competition_name"),
                "season": comp.get("season_name"),
                "match_id": match["match_id"],
                "match_date": match.get("match_date"),
                "home": (match.get("home_team") or {}).get("home_team_name"),
                "away": (match.get("away_team") or {}).get("away_team_name"),
            })
            if len(selected) >= limit:
                return selected
    return selected


def fetch_statsbomb(limit: int):
    selected = collect_statsbomb(limit)
    frames = []
    report_matches = []
    offset = 0.0
    for i, meta in enumerate(selected, 1):
        mid = meta["match_id"]
        event_path = os.path.join(CACHE, "events", f"{mid}.json")
        sixty_path = os.path.join(CACHE, "three-sixty", f"{mid}.json")
        try:
            get_json(f"{SB}/events/{mid}.json", event_path)
        except Exception as e:
            print(f"  skip events {mid}: {e}")
            continue
        try:
            get_json(f"{SB}/three-sixty/{mid}.json", sixty_path)
            has_360 = True
        except urllib.error.HTTPError:
            has_360 = False
            sixty_path = None
        except Exception as e:
            print(f"  no 360 {mid}: {e}")
            has_360 = False
            sixty_path = None
        match = convert_file(event_path, sixty_path)
        for fr in match.frames:
            fr.t = round(fr.t + offset, 3)
        frames.extend(match.frames)
        offset += 7200.0
        report_matches.append({**meta, "frames": len(match.frames), "has_360": has_360})
        print(f"  [{i:03d}/{len(selected):03d}] {mid} {meta['home']} v {meta['away']} -> {len(match.frames)} frames")

    fuel = Match(
        frames=frames,
        meta={
            "source": "statsbomb-fuel",
            "kind": "event-dense/frame-sparse",
            "matches": len(report_matches),
            "frames": len(frames),
            "note": "Aggregate StatsBomb open event/360 corpus for FMAS22 decision tuning.",
        },
    )
    os.makedirs(os.path.join(HERE, "sample"), exist_ok=True)
    canonical_path = os.path.join(HERE, "sample", "statsbomb_fuel.jsonl")
    calibration_path = os.path.join(HERE, "calibration_statsbomb_fuel.json")
    report_path = os.path.join(HERE, "fuel_report.json")
    fuel.to_jsonl(canonical_path)
    cal = calibrate(fuel)
    with open(calibration_path, "w") as f:
        json.dump(cal, f, indent=2)
    with open(report_path, "w") as f:
        json.dump({
            "source": "statsbomb",
            "limit": limit,
            "matches": report_matches,
            "canonical": canonical_path,
            "calibration": calibration_path,
            "frames": len(frames),
        }, f, indent=2)
    print("\n=== StatsBomb fuel ready ===")
    print(f"matches:     {len(report_matches)}")
    print(f"frames:      {len(frames)}")
    print(f"canonical:   {canonical_path}")
    print(f"calibration: {calibration_path}")
    print(f"report:      {report_path}")
    print("\nDecision calibration:")
    print(json.dumps(cal["decisions"], indent=2))


def idsse_pairs():
    try:
        from huggingface_hub import HfApi
    except ImportError:
        raise SystemExit("huggingface_hub not installed. Run: .venv/bin/python -m pip install huggingface_hub kloppy numpy")
    files = HfApi().list_repo_files("pysport/idsse-data", repo_type="dataset")
    pairs = {}
    for name in files:
        m = re.search(r"(DFL-COM-[^_]+)_(DFL-MAT-[^.]+)\.xml$", name)
        if not m:
            continue
        key = (m.group(1), m.group(2))
        item = pairs.setdefault(key, {})
        if "matchinformation" in name:
            item["meta"] = name
        elif "positions_raw_observed" in name:
            item["raw"] = name
        elif "events_raw" in name:
            item["events"] = name
    return [(key, item) for key, item in sorted(pairs.items()) if item.get("meta") and item.get("raw")]


def fetch_idsse(output_rate: float, limit: int | None):
    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        raise SystemExit("huggingface_hub not installed. Run: .venv/bin/python -m pip install huggingface_hub kloppy numpy")
    from idsse import convert

    pairs = idsse_pairs()
    if limit:
        pairs = pairs[:limit]
    raw_dir = os.path.join(HERE, "idsse_raw")
    frames = []
    report_matches = []
    offset = 0.0
    for i, ((competition_id, match_id), item) in enumerate(pairs, 1):
        print(f"  [{i:02d}/{len(pairs):02d}] downloading {match_id}")
        meta_path = hf_hub_download(
            repo_id="pysport/idsse-data",
            repo_type="dataset",
            filename=item["meta"],
            local_dir=raw_dir,
        )
        raw_path = hf_hub_download(
            repo_id="pysport/idsse-data",
            repo_type="dataset",
            filename=item["raw"],
            local_dir=raw_dir,
        )
        if item.get("events"):
            hf_hub_download(
                repo_id="pysport/idsse-data",
                repo_type="dataset",
                filename=item["events"],
                local_dir=raw_dir,
            )
        match = convert(meta_path, raw_path, output_rate=output_rate)
        for fr in match.frames:
            fr.t = round(fr.t + offset, 3)
        frames.extend(match.frames)
        offset += 7200.0
        report_matches.append({
            "competition_id": competition_id,
            "match_id": match_id,
            "frames": len(match.frames),
            "rate_hz": output_rate,
            "home": match.meta.get("home"),
            "away": match.meta.get("away"),
            "license": match.meta.get("license"),
        })
        print(f"       -> {len(match.frames)} frames @ {output_rate:g} Hz")

    fuel = Match(
        frames=frames,
        meta={
            "source": "idsse-fuel",
            "kind": "frame-dense/all-22",
            "license": "CC BY 4.0",
            "rate_hz": output_rate,
            "matches": len(report_matches),
            "frames": len(frames),
            "note": "Aggregate IDSSE all-22 tracking corpus for FMAS22 movement/off-ball tuning.",
        },
    )
    os.makedirs(os.path.join(HERE, "sample"), exist_ok=True)
    suffix = f"{output_rate:g}hz".replace(".", "p")
    canonical_path = os.path.join(HERE, "sample", f"idsse_fuel_{suffix}.jsonl")
    calibration_path = os.path.join(HERE, f"calibration_idsse_fuel_{suffix}.json")
    report_path = os.path.join(HERE, f"idsse_fuel_report_{suffix}.json")
    fuel.to_jsonl(canonical_path)
    cal = calibrate(fuel)
    with open(calibration_path, "w") as f:
        json.dump(cal, f, indent=2)
    with open(report_path, "w") as f:
        json.dump({
            "source": "idsse",
            "output_rate_hz": output_rate,
            "matches": report_matches,
            "canonical": canonical_path,
            "calibration": calibration_path,
            "frames": len(frames),
        }, f, indent=2)
    print("\n=== IDSSE tracking fuel ready ===")
    print(f"matches:     {len(report_matches)}")
    print(f"frames:      {len(frames)}")
    print(f"canonical:   {canonical_path}")
    print(f"calibration: {calibration_path}")
    print(f"report:      {report_path}")
    print("\nMovement calibration:")
    print(json.dumps(cal["movement"], indent=2))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--statsbomb", action="store_true")
    parser.add_argument("--idsse", action="store_true")
    parser.add_argument("--limit", type=int, default=120)
    parser.add_argument("--rate", type=float, default=5.0)
    args = parser.parse_args()
    if args.statsbomb:
        fetch_statsbomb(args.limit)
    elif args.idsse:
        fetch_idsse(args.rate, args.limit)
    else:
        parser.error("choose --statsbomb or --idsse")


if __name__ == "__main__":
    main()
