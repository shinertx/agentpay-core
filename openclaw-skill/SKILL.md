# AgentPay Core (USDC on Base) — OpenClaw Skill

## What it is
AgentPay Core is a **pay-per-call rail** for OpenClaw skills using **USDC on Base**.

It provides a standard flow:
1) **Quote** a price for an action
2) **Authorize** (scoped, time-limited) usage
3) **Record usage** + attach run/artifact proofs
4) Produce **verifiable receipts**
5) Enforce **idempotency** to prevent double-charge

## Why it exists (agent pain)
- Agents retry → double-charge risk without idempotency
- Operators need spend limits + audit trails
- Skill authors need metering + receipts to charge safely

## Chain / Token
- Network: **Base** (default)
- Token: **USDC**
- Dev mode: Base Sepolia + testnet USDC (until mainnet launch)

## Minimal API (v0)
- `GET /v1/quote?sku=<action>&units=<n>`
  - returns `{price_usdc, expiresAt, quoteId}`
- `POST /v1/authorize`
  - body `{quoteId, principal, scope, ttlSeconds, idempotencyKey}`
  - returns `{authorizationId, token}` (token is signed; scoped)
- `POST /v1/usage/record`
  - body `{authorizationId, runId, unitsUsed, callRef, proofs:[...], idempotencyKey}`
  - returns `{receiptId}`
- `GET /v1/receipt/:receiptId`
  - returns receipt with signatures + pointers to run artifacts

## Payment model (v0)
- **Prepay deposit** USDC to a wallet address → system issues scoped authorizations until balance is exhausted.
- (Later) on-chain per-call settlement or escrow.

## Safety defaults
- No transfers without explicit operator approval (until policies/limits are proven).
- All calls require idempotency keys.
- Receipts always include runId + evidence pointers.

## TODO (next)
- Reference TypeScript client + examples
- Base Sepolia contract or ledger-backed escrow (v1)
- Policies: per-principal spend caps; allowlists
