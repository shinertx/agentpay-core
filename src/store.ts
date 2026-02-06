import crypto from 'node:crypto';
import type { Authorization, Quote, Receipt, UsageRecord } from './types.js';

// v0 in-memory store. Replace with Redis/Postgres.
const quotes = new Map<string, Quote>();
const authByIdem = new Map<string, Authorization>();
const auths = new Map<string, Authorization>();
const usageByIdem = new Map<string, { receiptId: string }>();
const receipts = new Map<string, Receipt>();

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function putQuote(q: Quote) {
  quotes.set(q.quoteId, q);
}
export function getQuote(id: string) {
  return quotes.get(id);
}

export function getOrCreateAuthorization(idempotencyKey: string, create: () => Authorization): Authorization {
  const existing = authByIdem.get(idempotencyKey);
  if (existing) return existing;
  const a = create();
  authByIdem.set(idempotencyKey, a);
  auths.set(a.authorizationId, a);
  return a;
}

export function getAuthorization(id: string) {
  return auths.get(id);
}

export function getOrCreateUsage(idempotencyKey: string, create: () => { receipt: Receipt }): { receiptId: string } {
  const existing = usageByIdem.get(idempotencyKey);
  if (existing) return existing;
  const { receipt } = create();
  receipts.set(receipt.receiptId, receipt);
  const res = { receiptId: receipt.receiptId };
  usageByIdem.set(idempotencyKey, res);
  return res;
}

export function getReceipt(id: string) {
  return receipts.get(id);
}

export function validateUsage(a: Authorization, u: UsageRecord) {
  const now = Date.now();
  if (Date.parse(a.expiresAt) < now) throw new Error('authorization expired');
  if (u.authorizationId !== a.authorizationId) throw new Error('authorization mismatch');
  if (u.unitsUsed <= 0) throw new Error('unitsUsed must be > 0');
}
