#!/usr/bin/env python3
"""
run_pipeline.py — runs the whole spine end-to-end in one command.

  python3 run_pipeline.py --synthetic         # offline wiring proof (no network)
  python3 run_pipeline.py --canonical X.jsonl # run consumers on a real canonical file

Demonstrates: source -> canonical -> calibrate + learn_policy -> distilled table.
"""
import sys, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))

def run(desc, *cmd):
    print(f"\n── {desc} ──")
    r = subprocess.run([sys.executable, *cmd], cwd=HERE)
    if r.returncode != 0:
        print(f"  (step failed: {desc})")
        sys.exit(r.returncode)
    return r.returncode == 0

def main():
    if "--synthetic" in sys.argv:
        print("=== FÚTBOLMAS pipeline: SYNTHETIC end-to-end (offline wiring proof) ===")
        run("1. generate synthetic match -> canonical",
            "synthetic.py", "sample/synthetic_match.jsonl")
        run("2. calibrate from canonical",
            "calibrate.py", "sample/synthetic_match.jsonl", "calibration.json")
        run("3a. IRL: extract (state,action) pairs",
            "learn_policy.py", "extract", "sample/synthetic_match.jsonl", "features.npz")
        run("3b. IRL: train policy",
            "learn_policy.py", "train", "features.npz", "policy.npz")
        run("3c. IRL: distill -> sim-embeddable table",
            "learn_policy.py", "distill", "policy.npz", "sim_table.json")
        run("4. map calibration -> sim constants",
            "apply_to_sim.py", "calibration.json")
        print("\n=== pipeline complete. On synthetic data the NUMBERS are arbitrary;")
        print("    the point is the WIRING runs end-to-end with no network. ===")
    elif "--canonical" in sys.argv:
        idx = sys.argv.index("--canonical")
        path = sys.argv[idx + 1]
        run("calibrate", "calibrate.py", path, "calibration.json")
        run("IRL extract", "learn_policy.py", "extract", path, "features.npz")
        run("IRL train", "learn_policy.py", "train", "features.npz", "policy.npz")
        run("IRL distill", "learn_policy.py", "distill", "policy.npz", "sim_table.json")
        run("map to sim", "apply_to_sim.py", "calibration.json")
    else:
        print(__doc__)

if __name__ == "__main__":
    main()
