#!/usr/bin/env python3
"""
adapters/synthetic.py
=====================
Generates a plausible synthetic match in the canonical format. This is NOT training data —
it exists so the entire pipeline (adapters -> canonical -> consumers) can be run and tested
HERE, with no network, proving the wiring before real data is ever fetched.

It produces 22 players in rough formations, a ball that gets passed around with realistic-ish
lengths, and event labels — enough that the calibration consumer and IRL consumer produce
sane-shaped output. The numbers are deliberately arbitrary; only the SHAPE is meaningful.
"""
import sys, os, math, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from canonical import Match, Frame, Ball, Player, Event, PITCH_L, PITCH_W

def _formation(team, attacking_right, rng):
    """Return 11 (id, x, y) tuples in a 4-3-3-ish shape."""
    side = 1 if attacking_right else -1
    base_x = PITCH_L / 2
    # columns from own goal outward (in attack dir)
    rows = [(-45, [0]), (-25, [-22, -8, 8, 22]), (0, [-18, 0, 18]), (20, [-20, 0, 20])]
    out = []
    i = 0
    for dx, ys in rows:
        for dy in ys:
            x = base_x + side * dx + rng.uniform(-2, 2)
            y = PITCH_W / 2 + dy + rng.uniform(-2, 2)
            out.append((f"{team}_{i}", min(max(x, 1), PITCH_L - 1), min(max(y, 1), PITCH_W - 1)))
            i += 1
    return out

def generate(seed=7, seconds=600, hz=25):
    rng = random.Random(seed)
    home = _formation("home", True, rng)
    away = _formation("away", False, rng)
    # mutable position dicts
    pos = {pid: [x, y] for pid, x, y in home + away}
    teams = {pid: ("home" if pid.startswith("home") else "away") for pid in pos}
    ball = [PITCH_L / 2, PITCH_W / 2]
    carrier = "home_8"
    frames = []
    n = int(seconds * hz)
    next_pass = rng.randint(15, 40)
    for k in range(n):
        t = k / hz
        ev = None
        # drift everyone gently toward a jittered home slot (keeps a formation shape)
        for pid, (x, y) in list(pos.items()):
            hx, hy = dict([(p, (a, b)) for p, a, b in home + away])[pid]
            pos[pid][0] += (hx - x) * 0.01 + rng.uniform(-0.05, 0.05)
            pos[pid][1] += (hy - y) * 0.01 + rng.uniform(-0.05, 0.05)
        # carrier moves toward ball; ball tracks carrier
        if carrier:
            cx, cy = pos[carrier]
            ball[0] += (cx - ball[0]) * 0.6
            ball[1] += (cy - ball[1]) * 0.6
        # periodically make a pass event
        if k >= next_pass and carrier:
            mates = [p for p in pos if teams[p] == teams[carrier] and p != carrier]
            recv = rng.choice(mates)
            end = {"x": round(pos[recv][0], 2), "y": round(pos[recv][1], 2)}
            # 25% turnover to nearest opponent
            turn = rng.random() < 0.25
            if turn:
                opps = [p for p in pos if teams[p] != teams[carrier]]
                recv = min(opps, key=lambda p: (pos[p][0] - pos[recv][0]) ** 2 + (pos[p][1] - pos[recv][1]) ** 2)
                ev = Event("pass", carrier, "incomplete", end)
            else:
                ev = Event("pass", carrier, "complete", end)
            carrier = recv
            next_pass = k + rng.randint(15, 45)
        players = [Player(pid, teams[pid], round(p[0], 2), round(p[1], 2)) for pid, p in pos.items()]
        frames.append(Frame(t=t, period=1 if t < seconds / 2 else 2,
                            ball=Ball(round(ball[0], 2), round(ball[1], 2)),
                            players=players, event=ev))
    m = Match(frames=frames, meta={"source": "synthetic", "rate_hz": hz,
                                   "home": "SYN-A", "away": "SYN-B", "note": "wiring test only"})
    m.fill_velocities()
    return m

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "sample", "synthetic_match.jsonl")
    out_dir = os.path.dirname(out)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    m = generate()
    m.to_jsonl(out)
    print(f"wrote {out}: {len(m.frames)} frames, {m.sample_rate_hz()}Hz")
