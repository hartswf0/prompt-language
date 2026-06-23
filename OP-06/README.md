# Operator 06 — Branch Studio

Operator 06 is the branch-based preproduction experiment: each frame can fork into alternate timelines, and collaborators can see which branch the other person is editing.

It is a static GitHub Pages client. It does not own production infrastructure. The page is wired to the maintained Cloudflare Worker deployed from `../OPERATOR`:

`https://beflix-call.hartswf0.workers.dev`

The local `worker.js` and `wrangler.toml` are legacy experiment snapshots only. Do not deploy them over the live `beflix-call` Worker.

## Runtime path

- Room signaling, reconnect, optional TURN, and server-side BEFLIX composition use the maintained Worker.
- Voice and text-video frames remain peer-to-peer over WebRTC.
- Branch edits, cursors, chat, and full tree snapshots travel over the reliable WebRTC control channel.
- The server composer is optional. If the Worker has no API secret or a request times out, the local deterministic composer still produces a branch sequence.

