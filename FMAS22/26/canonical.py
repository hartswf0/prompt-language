#!/usr/bin/env python3
"""
canonical.py — THE SPINE
========================
One normalized format that every data source converts INTO and every consumer reads FROM.
This is the single decision that makes the whole pipeline cohere instead of being four
disconnected scripts: adapters (idsse/statsbomb/metrica/skillcorner) -> Canonical -> consumers
(calibration / sim-replay / IRL training).

THE FORMAT (a match is a list of Frames):

Frame = {
  "t":      float,                      # seconds from kickoff
  "period": int,                        # 1 or 2
  "ball":   {"x": float, "y": float, "vx": float, "vy": float} | None,
  "players":[ {"id": str, "team": "home"|"away", "x": float, "y": float,
               "vx": float, "vy": float, "role": str|None} ],
  "event":  {"type": str, "player": str|None, "outcome": str|None,
             "end": {"x":float,"y":float}|None} | None
}

PITCH CONVENTION (canonical): 105 x 68 metres. Origin at a corner: x in [0,105] along the
long axis (attacking direction is +x for "home"), y in [0,68]. Every adapter MUST normalize
to this so consumers never branch on provider.

Why this exact shape: it is the minimal superset of what all four consumers need —
  * calibration wants player spread, near-ball counts, pass lengths   -> players[] + event
  * sim replay wants ball + 22 positions per frame                    -> ball + players[]
  * IRL wants (state, action) where state = positions, action = event -> both
  * the abductive labeler's facts are derivable from frame deltas      -> vx,vy + event
"""
from __future__ import annotations
import json, math
from dataclasses import dataclass, field, asdict
from typing import Optional

PITCH_L, PITCH_W = 105.0, 68.0


@dataclass
class Ball:
    x: float; y: float; vx: float = 0.0; vy: float = 0.0


@dataclass
class Player:
    id: str
    team: str            # "home" | "away"
    x: float; y: float
    vx: float = 0.0; vy: float = 0.0
    role: Optional[str] = None


@dataclass
class Event:
    type: str                          # pass | shot | carry | tackle | recovery | ...
    player: Optional[str] = None
    outcome: Optional[str] = None      # complete | incomplete | goal | saved | ...
    end: Optional[dict] = None         # {"x","y"} for passes/shots


@dataclass
class Frame:
    t: float
    period: int = 1
    ball: Optional[Ball] = None
    players: list = field(default_factory=list)   # list[Player]
    event: Optional[Event] = None


@dataclass
class Match:
    """A normalized match. `meta` carries source + team names + sample rate."""
    frames: list = field(default_factory=list)    # list[Frame]
    meta: dict = field(default_factory=dict)

    # ---- serialization (jsonl: one frame per line, meta on the first line) ----
    def to_jsonl(self, path: str):
        with open(path, "w") as f:
            f.write(json.dumps({"__meta__": self.meta}) + "\n")
            for fr in self.frames:
                f.write(json.dumps(_frame_to_dict(fr), separators=(",", ":")) + "\n")

    @staticmethod
    def from_jsonl(path: str) -> "Match":
        frames, meta = [], {}
        with open(path) as f:
            for i, line in enumerate(f):
                line = line.strip()
                if not line:
                    continue
                d = json.loads(line)
                if i == 0 and "__meta__" in d:
                    meta = d["__meta__"]; continue
                frames.append(_dict_to_frame(d))
        return Match(frames=frames, meta=meta)

    # ---- convenience for consumers ----
    def sample_rate_hz(self) -> float:
        if len(self.frames) < 2:
            return self.meta.get("rate_hz", 25.0)
        dt = self.frames[1].t - self.frames[0].t
        return (1.0 / dt) if dt > 0 else self.meta.get("rate_hz", 25.0)

    def fill_velocities(self, hz: Optional[float] = None):
        """Derive vx,vy by finite difference where a source gives positions only."""
        hz = hz or self.sample_rate_hz()
        dt = 1.0 / hz
        prev = {}
        pball = None
        for fr in self.frames:
            for p in fr.players:
                if p.id in prev:
                    p.vx = (p.x - prev[p.id][0]) / dt
                    p.vy = (p.y - prev[p.id][1]) / dt
                prev[p.id] = (p.x, p.y)
            if fr.ball:
                if pball:
                    fr.ball.vx = (fr.ball.x - pball[0]) / dt
                    fr.ball.vy = (fr.ball.y - pball[1]) / dt
                pball = (fr.ball.x, fr.ball.y)
        return self


def _frame_to_dict(fr: Frame) -> dict:
    d = {"t": round(fr.t, 3), "period": fr.period}
    if fr.ball:
        d["ball"] = {"x": round(fr.ball.x, 2), "y": round(fr.ball.y, 2),
                     "vx": round(fr.ball.vx, 2), "vy": round(fr.ball.vy, 2)}
    d["players"] = [{"id": p.id, "team": p.team, "x": round(p.x, 2), "y": round(p.y, 2),
                     "vx": round(p.vx, 2), "vy": round(p.vy, 2),
                     **({"role": p.role} if p.role else {})} for p in fr.players]
    if fr.event:
        e = {"type": fr.event.type}
        if fr.event.player: e["player"] = fr.event.player
        if fr.event.outcome: e["outcome"] = fr.event.outcome
        if fr.event.end: e["end"] = fr.event.end
        d["event"] = e
    return d


def _dict_to_frame(d: dict) -> Frame:
    ball = Ball(**d["ball"]) if d.get("ball") else None
    players = [Player(**p) for p in d.get("players", [])]
    event = Event(**d["event"]) if d.get("event") else None
    return Frame(t=d["t"], period=d.get("period", 1), ball=ball, players=players, event=event)


# ---- validation: a consumer can assert a Match is well-formed before trusting it ----
def validate(match: Match) -> list:
    """Return a list of human-readable problems (empty = clean)."""
    problems = []
    if not match.frames:
        return ["no frames"]
    n_home = n_away = 0
    for i, fr in enumerate(match.frames[: min(len(match.frames), 5000)]):
        for p in fr.players:
            if not (0 <= p.x <= PITCH_L and 0 <= p.y <= PITCH_W):
                problems.append(f"frame {i}: player {p.id} out of pitch ({p.x:.1f},{p.y:.1f})")
                break
        if fr.ball and not (-2 <= fr.ball.x <= PITCH_L + 2 and -2 <= fr.ball.y <= PITCH_W + 2):
            problems.append(f"frame {i}: ball wildly off pitch")
        h = sum(1 for p in fr.players if p.team == "home")
        a = sum(1 for p in fr.players if p.team == "away")
        n_home = max(n_home, h); n_away = max(n_away, a)
        if len(problems) > 10:
            break
    if n_home > 11 or n_away > 11:
        problems.append(f"more than 11 per side seen (home {n_home}, away {n_away})")
    return problems


if __name__ == "__main__":
    # tiny self-test: build a 2-frame match, round-trip it, validate
    m = Match(meta={"source": "selftest", "rate_hz": 25})
    m.frames = [
        Frame(t=0.0, ball=Ball(52.5, 34), players=[Player("h1", "home", 50, 34), Player("a1", "away", 60, 34)]),
        Frame(t=0.04, ball=Ball(53, 34), players=[Player("h1", "home", 50.2, 34), Player("a1", "away", 59.8, 34)],
              event=Event("pass", "h1", "complete", {"x": 70, "y": 30})),
    ]
    m.fill_velocities()
    m.to_jsonl("/tmp/selftest.jsonl")
    m2 = Match.from_jsonl("/tmp/selftest.jsonl")
    print("round-trip frames:", len(m2.frames), "| meta:", m2.meta)
    print("validate:", validate(m2) or "clean")
    print("rate:", m2.sample_rate_hz(), "Hz")
