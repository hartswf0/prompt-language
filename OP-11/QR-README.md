# QR invite — build step

The guest-invite card now renders the join URL as a scannable QR code. To keep the
app a single self-contained file with **zero runtime dependencies**, the QR encoder is
*vendored inline* by a one-time build step rather than loaded from a CDN at runtime.

## Why a build step (and not a hand-rolled encoder)

A QR encoder is easy to get subtly wrong — the Reed-Solomon ECC and data-masking can
produce a code that looks correct but won't scan on a real phone. Rather than ship an
unverified hand-rolled encoder, `build-qr.js` pulls a battle-tested implementation
(`qrcode-generator` by Kazuhiko Arase, MIT — the reference most browser QR libs derive
from), **validates that it actually encodes** (finder patterns, timing pattern, dark
ratio), and splices it into the HTML. The result has no network/runtime dependency.

## Run it once (on a machine with internet)

```bash
node build-qr.js
# or target a specific copy:
node build-qr.js path/to/operator-studio.html
```

It writes `operator-studio.html.bak` first, then replaces the
`/* QR-VENDOR-PLACEHOLDER */` block with the vendored encoder exposed as
`window.QRMini.encode(text, ecLevel)`. Re-running is guarded against double-inlining.

## Before you run it

The app still works — the invite link, Share, and Copy all function. `drawInviteQR()`
detects the missing encoder and simply hides the QR canvas. After the build step, the
QR appears automatically whenever there's a guest link.

## How the QR is wired (already in the HTML)

- `inviteURL()` builds the `#join=<code>&role=guest[&s=<base64 server>]` link (unchanged).
- `drawInviteQR(url)` runs on every `refreshInvite()`, encodes the URL, and paints
  black modules onto `#invite-qr` with a 4-module quiet zone.
- Styling follows the existing doctrine: hard black border, no radius, `pixelated`
  rendering so modules stay crisp at any DPI.

## Offline alternative

`qr_mini.js` is a from-scratch, dependency-free encoder included in this repo. It passes
the same structural validation, but has **not** been confirmed against a real QR decoder,
so it is not wired in by default. If you ever need QR generation with no build step and
accept the risk, you can paste its contents into the placeholder block and scan-test on
a phone before trusting it.
