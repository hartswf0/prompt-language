# Operator 04 — Shared Film Workspace

`operator-studio.html` treats the project as a shared film rather than one shared canvas. Every edit addresses a specific frame. Each collaborator keeps an independent playhead, while the timeline shows both positions and offers an optional follow mode.

The client is preconfigured for the maintained signaling Worker:

`https://beflix-call.hartswf0.workers.dev`

Signaling runs through Cloudflare. Voice, text-video frames, film edits, chat, and presence travel peer to peer over WebRTC. The host orders shared edits so concurrent drawing converges on both devices. A compact copy of the EDL and frames is saved in the room's Durable Object and restored when that room is reopened; live media is never stored there.

Use `../OPERATOR/wrangler.toml` for Worker deployments. The Worker files in this directory are legacy references and must not be deployed over the shared service.

`icaro-flip.html` is retained here as the timeline and mobile-interaction reference used by Operator 04.
