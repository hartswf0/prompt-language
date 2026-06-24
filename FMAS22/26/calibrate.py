#!/usr/bin/env python3
"""
consumers/calibrate.py
======================
Computes the sim's constants from ANY canonical Match — regardless of which source produced
it. This is the unification: the old kit had one analyzer per provider; now there is ONE,
because every provider has been normalized to the canonical format upstream.

Frame-dense sources (idsse) yield the movement constants (spread, near-ball, width).
Event-bearing sources (idsse, statsbomb) yield the decision constants (pass length, completion,
action mix). It computes whatever the data supports and says so.

OUTPUT: calibration.json (+ a printed report), in the schema apply_to_sim.py consumes.
"""
import sys, os, json, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from canonical import Match, validate, PITCH_L, PITCH_W

def _stat(xs):
    if not xs:
        return None
    xs = sorted(xs)
    n = len(xs)
    def pct(p): return xs[min(n - 1, int(p * n))]
    return {"mean": round(sum(xs) / n, 2), "median": round(pct(0.5), 2),
            "p25": round(pct(0.25), 2), "p75": round(pct(0.75), 2),
            "p90": round(pct(0.90), 2), "n": n}

def calibrate(match: Match) -> dict:
    probs = validate(match)
    spreads, near_ball, widths, lengths = [], [], [], []
    pass_lengths, comp, total = [], 0, 0
    n_pass = n_carry = n_shot = goals = shots = 0
    shot_dists = []

    # movement: only meaningful on continuous frame-dense tracking data.
    # StatsBomb 360 can contain 18+ player snapshots, but those are sparse event
    # frames, not 25Hz all-22 tracking. Prefer explicit source metadata, then
    # fall back to dense-player-count plus an actual high sample rate.
    kind = str(match.meta.get("kind", "")).lower()
    frame_dense = kind.startswith("frame-dense") or (
        match.sample_rate_hz() >= 10
        and sum(1 for f in match.frames[:200] if len(f.players) >= 18) > 50
    )
    step = max(1, len(match.frames) // 5000)
    for i in range(0, len(match.frames), step):
        fr = match.frames[i]
        if frame_dense and fr.ball and len(fr.players) >= 18:
            for team in ("home", "away"):
                pts = [(p.x, p.y) for p in fr.players if p.team == team]
                if len(pts) >= 9:
                    cx = sum(p[0] for p in pts) / len(pts)
                    cy = sum(p[1] for p in pts) / len(pts)
                    spr = sum(math.hypot(p[0] - cx, p[1] - cy) for p in pts) / len(pts)
                    spreads.append(spr)
                    if team == "home":
                        ys = [p[1] for p in pts]; xs = [p[0] for p in pts]
                        widths.append(max(ys) - min(ys)); lengths.append(max(xs) - min(xs))
            d = [math.hypot(p.x - fr.ball.x, p.y - fr.ball.y) for p in fr.players]
            near_ball.append(sum(1 for x in d if x < 12))

    # decisions: from events
    cur_poss_team = None
    for fr in match.frames:
        e = fr.event
        if not e:
            continue
        if e.type == "pass":
            n_pass += 1; total += 1
            if e.outcome == "complete":
                comp += 1
            if fr.ball and e.end:
                pass_lengths.append(math.hypot(e.end["x"] - fr.ball.x, e.end["y"] - fr.ball.y))
        elif e.type == "carry":
            n_carry += 1
        elif e.type == "shot":
            n_shot += 1; shots += 1
            if fr.ball:
                shot_dists.append(math.hypot(105 - fr.ball.x, 34 - fr.ball.y))
            if e.outcome == "goal":
                goals += 1

    tot_act = max(1, n_pass + n_carry + n_shot)
    out = {
        "source": match.meta.get("source", "?"),
        "data_kind": "frame-dense" if frame_dense else "event-only",
        "validation": probs or "clean",
        "movement": {
            "team_spread_m": _stat(spreads),
            "players_within_12m": _stat(near_ball),
            "team_width_m": _stat(widths),
            "team_length_m": _stat(lengths),
        } if frame_dense else "n/a (event-only source)",
        "decisions": {
            "pass_length_m": _stat(pass_lengths),
            "pass_completion": round(comp / total, 3) if total else None,
            "shot_conversion": round(goals / shots, 3) if shots else None,
            "shot_distance_m": _stat(shot_dists),
            "action_mix": {"pass": round(n_pass / tot_act, 3),
                           "carry": round(n_carry / tot_act, 3),
                           "shot": round(n_shot / tot_act, 3)},
        },
    }
    return out

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python3 calibrate.py <canonical.jsonl> [out.json]")
        sys.exit(1)
    m = Match.from_jsonl(sys.argv[1])
    result = calibrate(m)
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "calibration.json")
    out_dir = os.path.dirname(out)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    json.dump(result, open(out, "w"), indent=2)
    print(f"=== calibration from {result['source']} ({result['data_kind']}) ===")
    if isinstance(result["movement"], dict):
        mv = result["movement"]
        print(f"  team spread: {mv['team_spread_m']['mean'] if mv['team_spread_m'] else '?'} m")
        print(f"  near-ball:   {mv['players_within_12m']['mean'] if mv['players_within_12m'] else '?'}")
    d = result["decisions"]
    if d["pass_length_m"]:
        print(f"  pass length: median {d['pass_length_m']['median']} m, p90 {d['pass_length_m']['p90']} m")
    print(f"  completion:  {d['pass_completion']}")
    print(f"  action mix:  pass {d['action_mix']['pass']} / carry {d['action_mix']['carry']} / shot {d['action_mix']['shot']}")
    print(f"\nwrote {out}")
