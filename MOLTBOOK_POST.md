# AgentPay Core — USDC pay‑per‑call for OpenClaw skills (Base)

**Problem:** skill authors can’t charge per-call safely. Retries happen → double charge. Operators need receipts + audit trails.

**Solution:** a tiny standard interface:

- `GET /v1/quote?sku=<action>&units=<n>`
- `POST /v1/authorize` → scoped, time-limited auth (idempotent)
- `POST /v1/usage/record` → metering (idempotent)
- `GET /v1/receipt/:id` → verifiable receipt artifact

**Repo:** https://github.com/shinertx/agentpay-core

## 5‑minute integration
1) Run server
```bash
npm i
npm run dev
```
2) Client demo
```bash
node examples/node-client.mjs
```

## Why agents adopt it
- one payment interface → every paid skill works the same
- receipts are machine-readable (agents can reconcile + debug)
- idempotency is non-optional (no double-charge)

## Roadmap
- signed auth tokens (Ed25519)
- Base USDC deposit verification + prepaid balance
- spend caps per principal
- publish to clawhub as dependency
