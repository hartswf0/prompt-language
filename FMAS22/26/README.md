# FÚTBOLMAS Data & Pipeline Map

The honest answer to "what of all the other data and pipelines." This is one spine, not four
scripts. Every data source converts INTO a canonical format; every consumer reads FROM it.

```
  SOURCES (*.py adapters)         SPINE              CONSUMERS (*.py)
  ──────────────────         ───────────         ──────────────────────
  idsse-data  ─┐                                  ┌─ calibrate.py  → calibration.json
  (all-22)     │                                  │    (constants for the sim)
  statsbomb  ──┤──→  canonical.py (Match)  ──→─────┤
  (events)     │     {frames: ball+22players      │─ learn_policy.py → policy + sim_table.json
  metrica    ──┤      +events, 105x68 m}          │    (IRL/behavioral cloning, offline)
  skillcorner ─┤                                  │
  synthetic  ──┘  (wiring test, no network)       └─ replay → sim (planned bridge)
```

## The four states of "the other data" — stated honestly

| Thing | State | Where |
|---|---|---|
| The sim engine (anticipation, predicted-world, abductive labeler) | **built + wired** | `wc.html` |
| Canonical format (the spine) | **built + tested** | `canonical.py` |
| Source adapters (synthetic/statsbomb/idsse) | **built; synthetic tested here, real ones need data** | `synthetic.py`, `statsbomb.py`, `idsse.py` |
| Calibration consumer | **built + runs end-to-end on synthetic** | `calibrate.py` |
| IRL/learning consumer | **built + runs end-to-end on synthetic** | `learn_policy.py` |
| Real measured numbers flowing back into the sim | **NOT DONE — needs you to run with network** | (the one true gap) |
| Live SofaScore feed | **out of scope (ToS forbids)** | — |
| Broadcast→all-22 reconstruction | **out of scope (separate research project)** | — |
| LLM+Bayesian runtime world-model | **rejected (would dissolve the artifact)** | — |

The single remaining gap is the last live row: the pipeline is built and proven, but the
**real data has never flowed through it**, because that requires network and only you can run
it. Everything below is how you close that gap.

## Run the whole thing

```bash
# 0. Prove the wiring with synthetic data (works offline, no deps beyond numpy):
python3 run_pipeline.py --synthetic

# 1. With REAL data (on a connected machine):
#    a. get data
pip install kloppy huggingface_hub numpy
python3 -c "from huggingface_hub import snapshot_download; snapshot_download('pysport/idsse-data', repo_type='dataset', local_dir='idsse_raw')"
#       (StatsBomb: git clone github.com/statsbomb/open-data)

#    b. convert source -> canonical
python3 idsse.py idsse_raw/<match>_meta.xml idsse_raw/<match>_positions.xml sample/idsse.jsonl

#    c. calibrate (movement + decision constants)
python3 calibrate.py sample/idsse.jsonl calibration.json

#    d. (optional) learn an off-ball policy and distill it
python3 learn_policy.py extract sample/idsse.jsonl features.npz
python3 learn_policy.py train   features.npz policy.npz
python3 learn_policy.py distill  policy.npz   sim_table.json

#    e. see exactly what to change in wc.html
python3 apply_to_sim.py calibration.json
```

## How each piece connects to the sim

- **calibrate.py → wc.html constants.** `apply_to_sim.py` reads `calibration.json` and prints,
  for each tunable sim constant, its current value, the measured target, the code string to
  find, and the direction to nudge. Apply ONE at a time, re-validate with the headless harness.
- **learn_policy.py → wc.html (via distillation).** The trained policy is offline-only, but its
  distilled `sim_table.json` is small enough to embed as an off-ball move-direction prior — the
  "chunking" layer. The sim reads the table O(1); no neural net ships.
- **canonical.py → everything.** Because every source is normalized first, adding SkillCorner or
  Metrica later means writing ONE adapter, and all consumers work on it unchanged.

## Why this design (the decision that matters)

The temptation was four provider-specific scripts. Instead there is one canonical format and a
strict adapter/consumer split. Cost: one indirection. Benefit: the calibration logic, the
sim-replay loader, and the IRL feature extractor are written ONCE and work on any source. The
whole reason the earlier kit felt like sprawl was that each source had bespoke logic; the spine
removes that.
