# Operator 03

Open `operator-edge.html` from the repository's GitHub Pages index. It is preconfigured to use the shared hardened signaling Worker:

`https://beflix-call.hartswf0.workers.dev`

The Worker only exchanges WebRTC setup messages. Video and chat travel peer to peer. No TURN relay is configured yet, so calls between strict networks can still fail even when room signaling succeeds.

Do not deploy this directory's legacy `worker.js` or `wrangler.toml` over the shared service. The maintained Worker source and deployment configuration are in `../OPERATOR/`.
