export type Quote = {
  quoteId: string;
  sku: string;
  units: number;
  priceUSDC: string; // decimal string
  expiresAt: string; // ISO
};

export type Authorization = {
  authorizationId: string;
  quoteId: string;
  principal: string;
  scope: string;
  ttlSeconds: number;
  issuedAt: string;
  expiresAt: string;
  idempotencyKey: string;
};

export type UsageRecord = {
  authorizationId: string;
  runId: string;
  unitsUsed: number;
  callRef?: string;
  proofs?: Array<{ kind: string; ref: string }>;
  idempotencyKey: string;
};

export type Receipt = {
  receiptId: string;
  timestamp: string;
  payerPrincipal: string;
  payee: { kind: "skill"; name: string; version?: string };
  sku: string;
  units: number;
  priceUSDC: string;
  runId: string;
  proofs: Array<{ kind: string; ref: string }>;
  authorizationId: string;
};
