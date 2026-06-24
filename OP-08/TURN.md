# Operator 08 Cloudflare TURN activation

OP-08 is wired to the production Worker at:

```text
https://beflix-call.hartswf0.workers.dev
```

The Worker currently works for room signaling and STUN. To make calls reliable across strict NAT, campus networks, mobile carriers, and long-distance pairs, activate Cloudflare Realtime TURN by installing two Worker secrets.

## Required Cloudflare permissions

The TURN key API requires a Cloudflare API token with `Calls Write`.

Wrangler's normal OAuth login is not enough unless it includes that scope.

## Create a TURN key

Use the Cloudflare dashboard, or run the documented API call with a token that has `Calls Write`:

```bash
curl "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/calls/turn_keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -d '{"name":"prompt-language-op08"}'
```

The response contains:

- `result.uid` → use as `CF_TURN_KEY_ID`
- `result.key` → use as `CF_TURN_API_TOKEN`

Do not commit either value.

## Store the Worker secrets

```bash
npx wrangler secret put CF_TURN_KEY_ID --config OP-08/wrangler.toml
npx wrangler secret put CF_TURN_API_TOKEN --config OP-08/wrangler.toml
npx wrangler deploy --config OP-08/wrangler.toml
```

## Verify

```bash
curl -H "Origin: https://hartswf0.github.io" \
  -H "Accept: application/json" \
  https://beflix-call.hartswf0.workers.dev/health
```

Expected after activation:

```json
{"ok":true,"service":"beflix-signaling","composer":false,"turn":"cloudflare"}
```

Then:

```bash
curl -H "Origin: https://hartswf0.github.io" \
  -H "Accept: application/json" \
  https://beflix-call.hartswf0.workers.dev/turn
```

The response should include `turn:` or `turns:` URLs.

## Cost note

Cloudflare STUN is free and unlimited. Cloudflare Realtime TURN/SFU has a 1,000 GB/month free tier, then usage is billed at $0.05/GB of egress. TURN traffic is only used when a direct WebRTC path fails or when the selected browser/network chooses the relay candidate.
