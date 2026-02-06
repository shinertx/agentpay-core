import express from 'express';
import { z } from 'zod';
import { getAuthorization, getOrCreateAuthorization, getOrCreateUsage, getQuote, getReceipt, newId, putQuote, validateUsage } from './store.js';
import type { Quote, Receipt, UsageRecord } from './types.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

// --- Config (v0) ---
const PAYEE_SKILL = process.env.AGENTPAY_PAYEE_SKILL ?? 'agentpay-core';

// --- Schemas ---
const QuoteQuery = z.object({ sku: z.string().min(1), units: z.coerce.number().int().positive().default(1) });
const AuthorizeBody = z.object({
  quoteId: z.string().min(1),
  principal: z.string().min(1),
  scope: z.string().min(1),
  ttlSeconds: z.number().int().positive().max(60 * 60 * 24),
  idempotencyKey: z.string().min(8)
});
const UsageBody = z.object({
  authorizationId: z.string().min(1),
  runId: z.string().min(1),
  unitsUsed: z.number().int().positive(),
  callRef: z.string().optional(),
  proofs: z.array(z.object({ kind: z.string(), ref: z.string() })).optional(),
  idempotencyKey: z.string().min(8)
});

// v0 pricing: $0.05 per unit
function priceUSDC(units: number): string {
  const cents = 5 * units;
  return (cents / 100).toFixed(2);
}

app.get('/v1/quote', (req, res) => {
  const parsed = QuoteQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { sku, units } = parsed.data;
  const quoteId = newId('q');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const q: Quote = { quoteId, sku, units, priceUSDC: priceUSDC(units), expiresAt };
  putQuote(q);
  res.json(q);
});

app.post('/v1/authorize', (req, res) => {
  const parsed = AuthorizeBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { quoteId, principal, scope, ttlSeconds, idempotencyKey } = parsed.data;
  const q = getQuote(quoteId);
  if (!q) return res.status(404).json({ error: 'quote not found' });
  if (Date.parse(q.expiresAt) < Date.now()) return res.status(400).json({ error: 'quote expired' });

  const a = getOrCreateAuthorization(idempotencyKey, () => {
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    return {
      authorizationId: newId('auth'),
      quoteId,
      principal,
      scope,
      ttlSeconds,
      issuedAt,
      expiresAt,
      idempotencyKey
    };
  });

  // v0 token = opaque (later: signed JWT/Ed25519)
  const token = `v0.${a.authorizationId}`;
  res.json({ authorizationId: a.authorizationId, token, expiresAt: a.expiresAt });
});

app.post('/v1/usage/record', (req, res) => {
  const parsed = UsageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const u = parsed.data as UsageRecord;
  const a = getAuthorization(u.authorizationId);
  if (!a) return res.status(404).json({ error: 'authorization not found' });

  try {
    validateUsage(a, u);
  } catch (e: any) {
    return res.status(400).json({ error: e?.message ?? 'invalid usage' });
  }

  const result = getOrCreateUsage(u.idempotencyKey, () => {
    const receiptId = newId('r');
    const receipt: Receipt = {
      receiptId,
      timestamp: new Date().toISOString(),
      payerPrincipal: a.principal,
      payee: { kind: 'skill', name: PAYEE_SKILL },
      sku: `quote:${a.quoteId}`,
      units: u.unitsUsed,
      priceUSDC: priceUSDC(u.unitsUsed),
      runId: u.runId,
      proofs: u.proofs ?? [],
      authorizationId: a.authorizationId
    };
    return { receipt };
  });

  res.json(result);
});

app.get('/v1/receipt/:id', (req, res) => {
  const r = getReceipt(req.params.id);
  if (!r) return res.status(404).json({ error: 'receipt not found' });
  res.json(r);
});

app.get('/healthz', (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`agentpay-core listening on :${port}`);
});
