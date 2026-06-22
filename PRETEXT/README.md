# PRETEXT Reference

This directory preserves the deployed Icaro Quine demo from [`hartswf0/pretext-field`](https://github.com/hartswf0/pretext-field) as an architectural reference for BEFLIX Call.

Source demo: `https://hartswf0.github.io/pretext-field/pages/demos/icaro-quine/`

## Icaro Quine architecture

The architecture separates representation from presentation:

1. A `128 × 96` value grid is the canonical frame.
2. Source imagery, compiled script marks, and hand-drawn marks are layers that resolve into that grid.
3. The active BEFLIX program is normalized and repeated into a prepared glyph field.
4. Grid values mask or tint the glyph field.
5. The program therefore becomes both the instruction stream and the visible material of the resulting image.

The copied reference remains intentionally intact apart from changing its generated JavaScript URL to the local `icaro-quine.js` bundle. GIF export still loads `gif.js` and its worker from jsDelivr.

## Operator adaptation

`../OPERATOR/beflix-call.html` uses the same core pipeline without importing the editor UI:

```text
camera → 128×96 value grid → PRETEXT envelope → WebRTC
                                              ↓
canvas ← grid mask ← repeated envelope glyph field
```

The receiver does not render a separate decorative code layer. It renders the exact PRETEXT envelope that carried the decoded frame. Local self-view uses the envelope it is about to transmit. This preserves the quine invariant across the network boundary.
