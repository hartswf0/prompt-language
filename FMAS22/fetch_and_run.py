#!/usr/bin/env python3
"""
fetch_and_run.py — RUN THIS ON A CONNECTED MACHINE (this is the one step the sandbox can't do).

It downloads a real open-data match, converts it through the canonical spine, calibrates it,
and prints the exact sim constants to change. One command, real fuel.

  # StatsBomb (event data, hundreds of free matches, no auth):
  python3 fetch_and_run.py statsbomb

  # idsse all-22 tracking (needs kloppy + huggingface_hub; strongest source):
  pip install kloppy huggingface_hub
  python3 fetch_and_run.py idsse

It caches downloads so re-runs are offline. The StatsBomb path uses only the standard library.
"""
import sys, os, json, urllib.request, ssl

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
CACHE = os.path.join(HERE, "_cache")
os.makedirs(CACHE, exist_ok=True)

SB = "https://raw.githubusercontent.com/statsbomb/open-data/master/data"

def _get(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return dest
    print(f"  downloading {os.path.basename(dest)} ...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
        data = r.read()
    with open(dest, "wb") as f:
        f.write(data)
    return dest

def run_statsbomb():
    from statsbomb import convert_file
    from calibrate import calibrate
    # pick a known free match with 360 data: e.g. a 2022 World Cup match.
    # competitions.json lists everything; here we grab one match directly.
    comps = json.load(open(_get(f"{SB}/competitions.json", os.path.join(CACHE, "competitions.json"))))
    # find a competition that has 360 data
    has360 = [c for c in comps if c.get("match_available_360")]
    pick = (has360 or comps)[0]
    cid, sid = pick["competition_id"], pick["season_id"]
    print(f"  competition: {pick.get('competition_name')} {pick.get('season_name')} "
          f"(360={'yes' if pick.get('match_available_360') else 'no'})")
    matches = json.load(open(_get(f"{SB}/matches/{cid}/{sid}.json", os.path.join(CACHE, f"m_{cid}_{sid}.json"))))
    mid = matches[0]["match_id"]
    ev_path = _get(f"{SB}/events/{mid}.json", os.path.join(CACHE, "events", f"{mid}.json")) \
        if os.makedirs(os.path.join(CACHE, "events"), exist_ok=True) is None else \
        _get(f"{SB}/events/{mid}.json", os.path.join(CACHE, "events", f"{mid}.json"))
    # also pull the separate 360 file if present
    os.makedirs(os.path.join(CACHE, "three-sixty"), exist_ok=True)
    try:
        _get(f"{SB}/three-sixty/{mid}.json", os.path.join(CACHE, "three-sixty", f"{mid}.json"))
    except Exception:
        print("  (no 360 file for this match — event-only)")
    m = convert_file(ev_path, os.path.join(CACHE, "three-sixty", f"{mid}.json"))
    canon = os.path.join(HERE, "sample", f"statsbomb_{mid}.jsonl")
    os.makedirs(os.path.join(HERE, "sample"), exist_ok=True)
    m.to_jsonl(canon)
    print(f"  canonical: {canon} ({len(m.frames)} frames, has_360={m.meta.get('has_360')})")
    cal = calibrate(m)
    json.dump(cal, open(os.path.join(HERE, "calibration.json"), "w"), indent=2)
    print("\n=== REAL calibration (StatsBomb event data) ===")
    print(json.dumps(cal["decisions"], indent=2))
    print("\nCalibration written. Use calibration.json to tune the sim constants.")

def run_idsse():
    print("idsse path: install deps, then download via huggingface_hub:")
    print('  pip install kloppy huggingface_hub')
    print('  python3 -c "from huggingface_hub import snapshot_download; '
          "snapshot_download('pysport/idsse-data', repo_type='dataset', local_dir='idsse_raw')\"")
    print("  then convert the Sportec XML into canonical jsonl and run:")
    print("        python3 calibrate.py sample/idsse.jsonl calibration.json")
    print("\n(idsse needs kloppy to parse the Sportec XML; the adapter handles the conversion.)")

if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "statsbomb"
    print(f"=== fetch_and_run: {src} ===")
    try:
        if src == "statsbomb":
            run_statsbomb()
        elif src == "idsse":
            run_idsse()
        else:
            print("usage: python3 fetch_and_run.py [statsbomb|idsse]")
    except urllib.error.URLError as e:
        print(f"\nNetwork error: {e}. This script must run on a machine with internet.")
