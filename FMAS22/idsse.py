#!/usr/bin/env python3
"""
adapters/idsse.py
=================
Converts pysport/idsse-data (measured all-22 TRACAB tracking, 25Hz, CC BY 4.0) into the
canonical format. This is the STRONGEST source: every player measured, continuous, with
synchronized events. Produces a FRAME-DENSE canonical Match (full tracking).

Loads via kloppy (the standard parser for the Sportec/DFL format idsse ships). This adapter
does no fetching; point it at the downloaded XML pair (metadata file + raw positions file).

  pip install kloppy huggingface_hub
  python3 -c "from huggingface_hub import snapshot_download; \\
      snapshot_download('pysport/idsse-data', repo_type='dataset', local_dir='idsse_raw')"

PITCH: Sportec coords are metres, origin at center. We shift to canonical [0,105]x[0,68].
"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from canonical import Match, Frame, Ball, Player, Event, PITCH_L, PITCH_W

def convert(meta_xml: str, raw_xml: str, max_frames: int = None, output_rate: float = None) -> Match:
    try:
        from kloppy import sportec
    except ImportError:
        raise SystemExit("kloppy not installed. pip install kloppy")
    ds = sportec.load_tracking(
        meta_data=meta_xml,
        raw_data=raw_xml,
        coordinates="sportec",
        limit=max_frames,
    )

    def shift(x, y):
        return (x + PITCH_L / 2.0, y + PITCH_W / 2.0)

    frames = []
    kframes = ds.frames if hasattr(ds, "frames") else list(ds)
    source_rate = float(getattr(ds.metadata, "frame_rate", 25) or 25)
    stride = max(1, round(source_rate / output_rate)) if output_rate else 1
    for kf in kframes[::stride]:
        ball = None
        if kf.ball_coordinates is not None:
            bx, by = shift(kf.ball_coordinates.x, kf.ball_coordinates.y)
            ball = Ball(round(bx, 2), round(by, 2))
        players = []
        for player, coord in kf.players_coordinates.items():
            if coord is None:
                continue
            x, y = shift(coord.x, coord.y)
            side = getattr(player, "team", None)
            ground = str(getattr(side, "ground", "") or "").lower() if side else ""
            team = "home" if str(ground).startswith("home") else "away"
            players.append(Player(str(getattr(player, "player_id", id(player))), team,
                                  round(x, 2), round(y, 2)))
        ts = getattr(kf, "timestamp", None)
        t = ts.total_seconds() if hasattr(ts, "total_seconds") else len(frames) / (output_rate or source_rate)
        period = getattr(kf, "period", None)
        frames.append(Frame(t=t,
                            period=period.id if period else 1,
                            ball=ball, players=players))
    m = Match(frames=frames, meta={"source": "idsse-data", "license": "CC BY 4.0",
                                   "rate_hz": output_rate or source_rate,
                                   "kind": "frame-dense/all-22",
                                   "home": getattr(ds.metadata.teams[0], "name", "home") if getattr(ds.metadata, "teams", None) else "home",
                                   "away": getattr(ds.metadata.teams[1], "name", "away") if getattr(ds.metadata, "teams", None) and len(ds.metadata.teams) > 1 else "away"})
    m.fill_velocities()
    return m

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("usage: python3 idsse.py <meta.xml> <raw_positions.xml> [out.jsonl] [sample_rate_hz]")
        sys.exit(1)
    output_rate = float(sys.argv[4]) if len(sys.argv) > 4 else None
    m = convert(sys.argv[1], sys.argv[2], output_rate=output_rate)
    out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(HERE, "sample", "idsse_match.jsonl")
    out_dir = os.path.dirname(out)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    m.to_jsonl(out)
    print(f"wrote {out}: {len(m.frames)} tracking frames @ {m.sample_rate_hz()}Hz")
