#!/usr/bin/env python3
"""
apply_to_sim.py — maps calibration.json (from consumers/calibrate.py) to the exact constants
to change in wc.html. Does NOT auto-edit: football constants interact, so apply one at a time
and re-validate with the headless harness each time.
"""
import sys, os, json

MAP = [
    {"name": "Team compactness (block spread)",
     "find": "const ax=p.home.x + team.dir*push*16",
     "sim_now": "spread ~26.6 m (push scale 16, lateral 0.34)",
     "path": ("movement", "team_spread_m", "mean"),
     "note": "If real < sim, increase lateral compaction (0.34→higher) / lower push scale."},
    {"name": "Players within 12m of ball (anti-swarm)",
     "find": "supportRank<4",
     "sim_now": "~3.0 (4 designated supporters, crowding radius 11m)",
     "path": ("movement", "players_within_12m", "mean"),
     "note": "If real < sim, drop a supporter (supportRank<4 → <3); if >, add one."},
    {"name": "Pass power / max length",
     "find": "if(d<3||d>42)continue",
     "sim_now": "pass candidate max range 42m; flight speed clamp 8..19",
     "path": ("decisions", "pass_length_m", "p90"),
     "note": "Set candidate max range near real p90 pass length (m). Do not treat pass length as ball speed."},
    {"name": "Pass completion (turnover tuning)",
     "find": "const err=(1-p.attrs.passing)*1.3",
     "sim_now": "pass error scales with (1-passing)*1.3",
     "path": ("decisions", "pass_completion", None),
     "note": "If sim completion ≠ real, scale the pass-error term to match."},
    {"name": "Shot conversion",
     "find": "const save=clamp(.62+.30*keeper.attrs.defending",
     "sim_now": "save 0.62..0.92; shot spread (5.5-2.2*finishing)",
     "path": ("decisions", "shot_conversion", None),
     "note": "Adjust keeper save floor / shot spread so goals/shot matches real (~0.10)."},
    {"name": "Action mix (pass/carry/shot)",
     "find": "p.candidates=[",
     "sim_now": "EV weights for SHOOT/PASS/DRIBBLE/HOLD",
     "path": ("decisions", "action_mix", None),
     "note": "Nudge EV baselines toward real pass/carry/shot ratio."},
]

def dig(d, path):
    for k in path:
        if k is None:
            return d
        if not isinstance(d, dict) or k not in d:
            return None
        d = d[k]
    return d

def main():
    if len(sys.argv) < 2:
        print("usage: python3 apply_to_sim.py calibration.json"); sys.exit(1)
    cal = json.load(open(sys.argv[1]))
    print("=" * 68)
    print(f"CALIBRATION ({cal.get('source','?')}, {cal.get('data_kind','?')}) → SIM CONSTANTS")
    print("apply ONE at a time, re-validate with the headless harness each time")
    print("=" * 68)
    for i, m in enumerate(MAP, 1):
        real = dig(cal, m["path"])
        print(f"\n[{i}] {m['name']}")
        print(f"    sim now : {m['sim_now']}")
        print(f"    real    : {real if real is not None else '(not in this data source)'}")
        print(f"    find    : {m['find']}")
        print(f"    action  : {m['note']}")

if __name__ == "__main__":
    main()
