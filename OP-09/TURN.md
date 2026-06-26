# Operator 09 Cloudflare TURN and multiway-room activation

OP-09 is the experimental multiway fork. Its Worker config deploys a separate service:

```text
https://beflix-call-op09.hartswf0.workers.dev
```

The copied studio can still point at the OP-08 production Worker until OP-09 is deployed. Once OP-09 is deployed, paste the URL above into the app's Server box or update the `beflix-worker-url` meta tag.

The OP-09 Worker exposes:

- existing two-person `/room/...` signaling
- new multi-peer `/op9/:room/(join|send|poll|leave|snapshot|ops)` state rooms
- TURN credentials for WebRTC relay

The multi-peer OP-09 state room is for shared editing, cursors, chat, branch-tree snapshots, and late joiners. 3+ live video/audio still needs an SFU layer; do not use peer-to-peer mesh for more than two video participants.

## Required Cloudflare permissions

The TURN key API requires a Cloudflare API token with `Calls Write`.

Wrangler's normal OAuth login is not enough unless it includes that scope.

## Create a TURN key

Use the Cloudflare dashboard, or run the documented API call with a token that has `Calls Write`:

```bash
curl "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/calls/turn_keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -d '{"name":"prompt-language-op09"}'
```

The response contains:

- `result.uid` → use as `CF_TURN_KEY_ID`
- `result.key` → use as `CF_TURN_API_TOKEN`

Do not commit either value.

## Store the Worker secrets

```bash
npx wrangler secret put CF_TURN_KEY_ID --config OP-09/wrangler.toml
npx wrangler secret put CF_TURN_API_TOKEN --config OP-09/wrangler.toml
npx wrangler deploy --config OP-09/wrangler.toml
```

## Verify

```bash
curl -H "Origin: https://hartswf0.github.io" \
  -H "Accept: application/json" \
  https://beflix-call-op09.hartswf0.workers.dev/health
```

Expected after activation:

```json
{"ok":true,"service":"beflix-signaling","op9":{"stateRooms":true,"maxPeers":12,"participantIds":true,"opLog":true,"snapshots":true,"media":"sfu-required-for-3plus-video"},"composer":false,"turn":"cloudflare"}
```

Then:

```bash
curl -H "Origin: https://hartswf0.github.io" \
  -H "Accept: application/json" \
  https://beflix-call-op09.hartswf0.workers.dev/turn
```

The response should include `turn:` or `turns:` URLs.

## Cost note

Cloudflare STUN is free and unlimited. Cloudflare Realtime TURN/SFU has a 1,000 GB/month free tier, then usage is billed at $0.05/GB of egress. TURN traffic is only used when a direct WebRTC path fails or when the selected browser/network chooses the relay candidate.
