#!/usr/bin/env python3
"""
consumers/learn_policy.py
=========================
The LEARNING path (the OpenSTARLab / inverse-RL thread), as a real runnable scaffold.

It reads canonical tracking frames and extracts (state -> action) examples for OFF-BALL
movement: given a player's local situation (own pos, ball pos/vel, nearest mates & opponents,
phase), predict their next move direction. Trains a small model by behavioral cloning
(imitation). This is the honest, buildable core of "learn how real players move off the ball."

WHY THIS IS A SEPARATE OFFLINE PROJECT, NOT IN THE SIM:
A neural policy cannot live in a single-file, zero-dependency, deterministic HTML game.
So the deliverable here is NOT a model the sim imports. It is:
   (1) a trained policy (saved weights), for offline analysis/validation, AND
   (2) a DISTILLED TABLE — the policy evaluated on a coarse grid of situations, exported as a
       compact lookup the sim CAN embed. That distillation is the "chunking" layer: real
       movement tendencies baked into a table a 300KB file can hold deterministically.

DEPENDENCIES: numpy only for the scaffold (a tiny linear/MLP by hand). For serious training,
swap in torch — the feature/target extraction is the reusable part and is framework-free.

USAGE:
  python3 consumers/learn_policy.py extract <canonical.jsonl> [features.npz]   # build dataset
  python3 consumers/learn_policy.py train   <features.npz> [policy.npz] [max_samples]
  python3 consumers/learn_policy.py distill  <policy.npz>  [sim_table.json]    # -> embeddable
"""
import sys, os, json, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np
from canonical import Match, PITCH_L, PITCH_W

# ---------- feature extraction: canonical frames -> (state, action) ----------
def extract(match: Match, horizon_frames=12):
    """For each off-ball player in each frame, state now -> normalized move dir `horizon` frames later."""
    X, Y = [], []
    frames = match.frames
    if len(frames) < horizon_frames + 1:
        return np.zeros((0, 10)), np.zeros((0, 2))
    # index players by id across frames
    for i in range(0, len(frames) - horizon_frames, 2):
        fr = frames[i]; fut = frames[i + horizon_frames]
        if not fr.ball:
            continue
        futpos = {p.id: (p.x, p.y) for p in fut.players}
        bx, by, bvx, bvy = fr.ball.x, fr.ball.y, fr.ball.vx, fr.ball.vy
        for p in fr.players:
            if p.id not in futpos:
                continue
            # skip the player nearest the ball (on-ball-ish); we model OFF-ball movement
            d_ball = math.hypot(p.x - bx, p.y - by)
            if d_ball < 3:
                continue
            mates = [(q.x, q.y) for q in fr.players if q.team == p.team and q.id != p.id]
            opps = [(q.x, q.y) for q in fr.players if q.team != p.team]
            nm = min(mates, key=lambda m: (m[0]-p.x)**2+(m[1]-p.y)**2) if mates else (p.x, p.y)
            no = min(opps, key=lambda m: (m[0]-p.x)**2+(m[1]-p.y)**2) if opps else (p.x, p.y)
            side = 1 if p.team == "home" else -1
            state = [p.x / PITCH_L, p.y / PITCH_W,
                     (bx - p.x) / PITCH_L, (by - p.y) / PITCH_W,
                     bvx / 20.0, bvy / 20.0,
                     (nm[0] - p.x) / 20.0, (nm[1] - p.y) / 20.0,
                     (no[0] - p.x) / 20.0, (no[1] - p.y) / 20.0]
            fx, fy = futpos[p.id]
            dx, dy = fx - p.x, fy - p.y
            n = math.hypot(dx, dy) or 1.0
            action = [dx / n, dy / n]   # unit move direction
            X.append(state); Y.append(action)
    return np.array(X), np.array(Y)

# ---------- a tiny 2-layer MLP by hand (numpy), so the scaffold runs with no torch ----------
class TinyMLP:
    def __init__(self, din=10, dh=24, dout=2, seed=0):
        rng = np.random.RandomState(seed)
        self.W1 = rng.randn(din, dh) * 0.3; self.b1 = np.zeros(dh)
        self.W2 = rng.randn(dh, dout) * 0.3; self.b2 = np.zeros(dout)
    def forward(self, X):
        self.h = np.tanh(X @ self.W1 + self.b1)
        return self.h @ self.W2 + self.b2
    def train(self, X, Y, epochs=200, lr=0.05, batch=256):
        n = len(X)
        for ep in range(epochs):
            idx = np.random.permutation(n)
            for s in range(0, n, batch):
                b = idx[s:s+batch]; xb, yb = X[b], Y[b]
                h = np.tanh(xb @ self.W1 + self.b1)
                pred = h @ self.W2 + self.b2
                g = (pred - yb) / len(b)
                gW2 = h.T @ g; gb2 = g.sum(0)
                gh = (g @ self.W2.T) * (1 - h**2)
                gW1 = xb.T @ gh; gb1 = gh.sum(0)
                self.W2 -= lr*gW2; self.b2 -= lr*gb2; self.W1 -= lr*gW1; self.b1 -= lr*gb1
        return self
    def save(self, path):
        np.savez(path, W1=self.W1, b1=self.b1, W2=self.W2, b2=self.b2)
    @staticmethod
    def load(path):
        d = np.load(path); m = TinyMLP()
        m.W1, m.b1, m.W2, m.b2 = d["W1"], d["b1"], d["W2"], d["b2"]; return m

# ---------- distillation: policy -> coarse table the SIM can embed ----------
def distill(policy: TinyMLP, gx=7, gy=5):
    """Evaluate the policy over a coarse grid of (player position x ball-relative) and export
    a compact table of preferred move directions. This is the sim-embeddable artifact."""
    table = []
    for ix in range(gx):
        for iy in range(gy):
            px, py = (ix + 0.5) / gx, (iy + 0.5) / gy
            # ball assumed central-ish; a fuller table would sweep ball pos too
            state = np.array([[px, py, 0.5 - px, 0.5 - py, 0, 0, 0.1, 0, -0.1, 0]])
            d = policy.forward(state)[0]
            n = math.hypot(d[0], d[1]) or 1
            table.append({"cell": [ix, iy], "dir": [round(float(d[0]/n), 3), round(float(d[1]/n), 3)]})
    return {"grid": [gx, gy], "note": "off-ball move-direction priors, distilled from tracking",
            "table": table}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "extract":
        m = Match.from_jsonl(sys.argv[2])
        X, Y = extract(m)
        out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(HERE, "features.npz")
        out_dir = os.path.dirname(out)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        np.savez(out, X=X, Y=Y)
        print(f"extracted {len(X)} (state,action) pairs -> {out}")
    elif cmd == "train":
        d = np.load(sys.argv[2]); X, Y = d["X"], d["Y"]
        if len(X) == 0:
            print("no training data"); sys.exit(1)
        if len(sys.argv) > 4:
            max_samples = int(sys.argv[4])
            if len(X) > max_samples:
                rng = np.random.RandomState(7)
                idx = rng.choice(len(X), size=max_samples, replace=False)
                X, Y = X[idx], Y[idx]
                print(f"sampled {max_samples} training rows from feature set")
        m = TinyMLP().train(X, Y)
        pred = m.forward(X)
        mse = float(((pred - Y) ** 2).mean())
        out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(HERE, "policy.npz")
        out_dir = os.path.dirname(out)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        m.save(out)
        # baseline: cosine similarity of predicted vs actual move dir
        cos = float((np.sum(pred*Y, 1) / (np.linalg.norm(pred,axis=1)*np.linalg.norm(Y,axis=1)+1e-9)).mean())
        print(f"trained: MSE {mse:.4f}, mean direction cosine {cos:.3f} (1=perfect) -> {out}")
    elif cmd == "distill":
        m = TinyMLP.load(sys.argv[2])
        table = distill(m)
        out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(HERE, "sim_table.json")
        out_dir = os.path.dirname(out)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        json.dump(table, open(out, "w"), indent=2)
        print(f"distilled policy -> {out} ({len(table['table'])} grid cells, sim-embeddable)")
