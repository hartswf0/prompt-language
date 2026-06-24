#!/usr/bin/env python3
"""
adapters/statsbomb.py
=====================
Converts StatsBomb open EVENT data into the canonical format.

StatsBomb is event data, not continuous tracking: it gives discrete events (pass/shot/carry)
with locations, plus optional 360 "freeze frames" (snapshots of nearby players at an event).
So the canonical Match it produces is EVENT-DENSE but FRAME-SPARSE: one frame per event, with
players[] populated only if a 360 freeze-frame exists for that event.

That is exactly right for the calibration consumer (which wants pass lengths, completion,
action mix) and partially useful for IRL (state from freeze-frames where present). It is NOT
full tracking — use the idsse adapter for all-22 continuous data.

PITCH: StatsBomb is 120x80 (x from defending goal). We scale to 105x68.
NETWORK: pass a local events JSON file (download from github.com/statsbomb/open-data),
or a directory of them. This adapter does no fetching itself.
"""
import sys, os, json, glob, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from canonical import Match, Frame, Ball, Player, Event, PITCH_L, PITCH_W

SB_L, SB_W = 120.0, 80.0
SX, SY = PITCH_L / SB_L, PITCH_W / SB_W

def _xy(loc):
    if not loc or len(loc) < 2:
        return None
    return (loc[0] * SX, loc[1] * SY)

def _load_360(sixty_path):
    """Load a StatsBomb three-sixty/<match_id>.json into {event_uuid: freeze_frame}.
    In the open-data repo, 360 freeze-frames are a SEPARATE file, joined to events by event id."""
    if not sixty_path or not os.path.exists(sixty_path):
        return {}
    try:
        with open(sixty_path) as f:
            rows = json.load(f)
        # each row: {"event_uuid": "...", "visible_area": [...], "freeze_frame": [{...}]}
        return {r["event_uuid"]: r.get("freeze_frame", []) for r in rows if r.get("event_uuid")}
    except Exception:
        return {}

def convert_file(path: str, sixty_path: str = None) -> Match:
    with open(path) as f:
        events = json.load(f)
    # auto-find the matching 360 file if not given: ../three-sixty/<same-name>.json
    if sixty_path is None:
        guess = os.path.join(os.path.dirname(os.path.dirname(path)), "three-sixty", os.path.basename(path))
        sixty_path = guess if os.path.exists(guess) else None
    ff360 = _load_360(sixty_path)

    frames = []
    for e in events:
        etype = e.get("type", {}).get("name", "").lower()
        if etype not in ("pass", "shot", "carry", "ball receipt*", "duel", "interception", "dribble"):
            continue
        mins = e.get("minute", 0); secs = e.get("second", 0)
        t = mins * 60 + secs
        loc = _xy(e.get("location"))
        ball = Ball(loc[0], loc[1]) if loc else None

        # players: prefer the richer separate-file 360 freeze frame; fall back to inline shot freeze_frame
        players = []
        ff = ff360.get(e.get("id")) or (e.get("shot", {}) or {}).get("freeze_frame")
        if ff:
            for i, fp in enumerate(ff):
                p = _xy(fp.get("location"))
                if not p:
                    continue
                # real schema: 'teammate' boolean; 'actor' marks the event player; 'keeper' on shots
                team = "home" if fp.get("teammate") else "away"
                role = "actor" if fp.get("actor") else ("gk" if fp.get("keeper") else None)
                players.append(Player(f"p{i}", team, p[0], p[1], role=role))

        ev = None
        if etype == "pass":
            end = _xy(e.get("pass", {}).get("end_location"))
            outcome = e.get("pass", {}).get("outcome", {}).get("name")
            ev = Event("pass", e.get("player", {}).get("name"),
                       "incomplete" if outcome else "complete",
                       {"x": round(end[0], 2), "y": round(end[1], 2)} if end else None)
        elif etype == "shot":
            outcome = e.get("shot", {}).get("outcome", {}).get("name", "")
            ev = Event("shot", e.get("player", {}).get("name"),
                       "goal" if outcome == "Goal" else outcome.lower())
        elif etype == "carry":
            ev = Event("carry", e.get("player", {}).get("name"))
        frames.append(Frame(t=t, period=e.get("period", 1), ball=ball, players=players, event=ev))
    m = Match(frames=frames, meta={"source": "statsbomb", "file": os.path.basename(path),
                                   "has_360": bool(ff360), "kind": "event-dense/frame-sparse"})
    return m

def convert_dir(path: str, limit: int = 50) -> list:
    files = sorted(glob.glob(os.path.join(path, "*.json")))[:limit]
    return [convert_file(f) for f in files]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python3 statsbomb.py <events.json | events_dir/> [out.jsonl]")
        print("  get data: github.com/statsbomb/open-data (data/events/*.json)")
        sys.exit(1)
    src = sys.argv[1]
    m = convert_file(src) if src.endswith(".json") else convert_dir(src)[0]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample", "statsbomb_match.jsonl")
    out_dir = os.path.dirname(out)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    m.to_jsonl(out)
    ev = sum(1 for f in m.frames if f.event)
    print(f"wrote {out}: {len(m.frames)} event-frames, {ev} events")
