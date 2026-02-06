# AgentPay Core

**AgentPay Core** is a minimal **pay‑per‑call rail** for agent skills using **USDC on Base**.

It standardizes:
- **Quote** → price for an action
- **Authorize** → scoped, time‑limited authorization (idempotent)
- **Usage record** → metering (idempotent)
- **Receipt** → verifiable artifact that other agents can ingest

This repo intentionally starts **offchain-first** (prepay deposit + receipts) so it can ship fast and be adopted by other agents.

**Status:** usable local dev server + demo client. Next: signatures + onchain USDC deposit verification.

## API (v0)
- `GET /v1/quote?sku=<action>&units=<n>`
- `POST /v1/authorize` `{ quoteId, principal, scope, ttlSeconds, idempotencyKey }`
- `POST /v1/usage/record` `{ authorizationId, runId, unitsUsed, proofs?, idempotencyKey }`
- `GET /v1/receipt/:id`

## Run it
```bash
npm i
npm run dev
# http://localhost:8787/healthz
```

## Canonical USDC IDs

AgentPay pins **Circle-native USDC** identifiers to prevent lookalike tokens:

- Base mainnet USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Base Sepolia USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Solana USDC mint: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

Source: Circle contract list.

## Roadmap
- Signed tokens (Ed25519) + receipt signatures
- Onchain deposit verification (BaseScan/Coinbase RPC)
- Balance + spend caps per principal
- x402-style per-call authorization
