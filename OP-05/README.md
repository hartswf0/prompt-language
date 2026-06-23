# Operator 05

`operator-studio.html` is the production candidate. It combines the compact mobile layout with the maintained service in `../OPERATOR/`.

## Runtime architecture

- GitHub Pages serves the static client.
- `../OPERATOR/worker.js` provides two-person signaling, peer leases, optional TURN credentials, durable film snapshots, and the optional server-side BEFLIX composer.
- Camera, voice, live frame data, cursors, and chat travel peer-to-peer over WebRTC. They do not pass through the Worker.
- Film edits are frame-addressed and host-ordered. Collaborators may select different shots without moving each other's playheads.
- A lost media link does not lock the editor. Automatic retries continue while the local film remains editable and exportable.

The files `worker.js`, `wrangler.toml`, and `operator-edge.html` in this directory are archived snapshots. Do not deploy them. Deploy only from `../OPERATOR/`.

## Composer

The Make panel contains the complete BEFLIX-128 animation prompt. A user can copy it, paste raw commands from any model, or use the Worker API. Browser code never accepts or stores an API key.

Enable the API path from `../OPERATOR/`:

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler deploy
```

Without that secret, prompt copy, command import, and the deterministic local demo still work.

## Recovery and export

The Save panel exports:

- current-frame PNG;
- labeled contact-sheet PNG;
- raw `.beflix` animation source;
- animated WebM or MP4 when the browser exposes a compatible `MediaRecorder` encoder;
- portable project JSON containing compressed grids, shot labels, EDL notes, holds, frame IDs, and FPS.

Project JSON is the recovery master. It remains available when WebRTC or TURN fails and can be imported later without losing editability.

## Verification

```bash
node --test OP-05/tests/studio.test.js
node -e 'const fs=require("fs");const h=fs.readFileSync("OP-05/operator-studio.html","utf8");const m=h.match(/<script>([\s\S]*?)<\/script>/);new Function(m[1])'
```

