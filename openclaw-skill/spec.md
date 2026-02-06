# Spec notes

## Receipts
Receipt must be verifiable offchain:
- receiptId, timestamp
- payer principal id
- payee (skill id/version)
- sku + units + price
- runId + artifact pointers
- signatures: issuer + optional payer

## Idempotency
Two layers:
- authorize idempotency (prevent duplicate auth)
- usage record idempotency (prevent double charge)

## Ledger
v0 ledger is internal (prepaid balance + usage records). v1 can migrate to onchain escrow/settlement.
