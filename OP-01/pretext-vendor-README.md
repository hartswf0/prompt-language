# Pretext vendor seam

OPERATOR consumes `@chenglou/pretext` through a port, so the real engine drops
in with **zero** OPERATOR code changes.

## Files
- `pretext-port.js` — the seam. Detects `window.Pretext` (real bundle) and
  forwards to it; otherwise runs an honest monospace-accurate shim so the call
  works today. OPERATOR only ever calls `window.PretextPort`.
- `pretext.js` — **you provide this.** A browser bundle of @chenglou/pretext
  that assigns `window.Pretext = { prepareWithSegments, walkLineRanges,
  measureLineStats, materializeLineRange, layoutWithLines, layoutNextLineRange }`.

## Producing pretext.js (real engine)
```
git clone https://github.com/chenglou/pretext
cd pretext && bun install
# bundle src to a browser global. e.g. with esbuild:
npx esbuild src/index.ts --bundle --format=iife --global-name=Pretext \
  --outfile=pretext.js
```
Then copy `pretext.js` into this folder. The page already loads it:
```
<script src="../../vendor/pretext.js" onerror="window.__noPretext=1"></script>
<script src="../../vendor/pretext-port.js"></script>
```
Reload OPERATOR; the status line shows `PT:real` instead of `PT:shim`.

## Why a shim at all
OPERATOR only typesets ASCII BEFLIX command lines in a monospace font. For that
input the shim's canvas measurement is exact, so the call is fully functional
now. The shim makes no claim of correctness for complex scripts — that is
precisely what the real Pretext engine provides, hence the swap path.
