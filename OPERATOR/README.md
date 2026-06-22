# BEFLIX Call Operator

BEFLIX Call is a one-to-one, camera-to-command WebRTC experiment. The browser converts camera frames into PRETEXT drawing commands, sends them over an unreliable data channel, and uses a reliable data channel for chat and recovery controls. A Cloudflare Worker provides room signaling and optional short-lived TURN credentials; it never handles live call media.

Operator 04 also uses the Worker to retain a bounded, RLE-compressed shared-film document. Only an authenticated room host can write it. This restores the EDL and frames when the room is reopened without routing live voice, camera, or cursor traffic through Cloudflare.

## Icaro Quine rendering

The call renderer follows the reference in `../PRETEXT/icaro-quine/`: each decoded `128 × 96` value grid masks a repeated glyph field built from the exact PRETEXT envelope that carried the frame. The message is therefore both the transport payload and the visible material of the image. No separate code-themed overlay is generated.

## Local verification

Requirements: Node.js 20 or newer and a Cloudflare account.

```bash
npm test
npm run dev
# in a second terminal
python3 -m http.server 8000
```

The Worker development URL is printed by Wrangler. Serve this directory at `http://localhost:8000`, paste the Worker URL under **Server & reliability settings**, and open the client in two browser windows. The configured origin allowlist includes ports `8000` on `localhost` and `127.0.0.1`.

## Deploy the Worker

The default `ALLOWED_ORIGINS` value permits the GitHub Pages origin for this repository. Change it in `wrangler.toml` before deploying from a different origin.

```bash
npx wrangler login
npm run deploy
```

Verify the returned URL:

```bash
curl https://YOUR-WORKER.workers.dev/health
```

The production Worker is deployed at `https://beflix-call.hartswf0.workers.dev` and is compiled into the client's `beflix-worker-url` meta tag. The client also stores manual overrides in local storage and accepts `?server=https://YOUR-WORKER.workers.dev` for alternate deployments.

## Configure TURN

Signaling works without TURN, but calls can still fail across restrictive networks. Choose one provider.

### Cloudflare Realtime TURN

Create a TURN key in Cloudflare, then store its key ID and API token as Worker secrets:

```bash
npx wrangler secret put CF_TURN_KEY_ID
npx wrangler secret put CF_TURN_API_TOKEN
npm run deploy
```

The API token must be able to generate credentials for that TURN key. Never place it in HTML or `wrangler.toml`.

### Self-hosted coturn

Set `TURN_URLS` in `wrangler.toml` and configure coturn with `use-auth-secret` and the same static secret, then run:

```bash
npx wrangler secret put TURN_SECRET
npm run deploy
```

## Publish the client

Commit this directory and the root GitHub Pages workflow. Open the app directly at:

`https://hartswf0.github.io/prompt-language/OPERATOR/beflix-call.html`

Camera access requires HTTPS. Launch the app as a top-level page rather than through the repository's sandboxed preview iframes.

## Operational limits

- Rooms permit exactly two active peers.
- Room codes are bearer secrets. Share them privately.
- Peer leases expire after two minutes without polling; an active client automatically rejoins.
- Signaling mailboxes are bounded to 64 messages and inactive signaling state is deleted after 15 minutes.
- Shared-film documents are bounded to 48 frames and 512 KB, then expire after 30 inactive days.
- This build transmits stylized camera frames and text chat. It does not transmit voice audio.
