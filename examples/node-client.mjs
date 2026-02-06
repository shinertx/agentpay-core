// Minimal Node client demo for AgentPay Core (v0)
// Run: node examples/node-client.mjs

const baseUrl = process.env.AGENTPAY_URL ?? 'http://localhost:8787';
const principal = process.env.AGENTPAY_PRINCIPAL ?? 'demo:agent';

const r1 = await fetch(`${baseUrl}/v1/quote?sku=demo.action&units=3`);
const quote = await r1.json();
console.log('quote', quote);

const authBody = {
  quoteId: quote.quoteId,
  principal,
  scope: 'tool:demo:invoke',
  ttlSeconds: 300,
  idempotencyKey: 'idem_auth_demo_001'
};

const r2 = await fetch(`${baseUrl}/v1/authorize`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(authBody)
});
const auth = await r2.json();
console.log('auth', auth);

const usageBody = {
  authorizationId: auth.authorizationId,
  runId: `run_${Date.now()}`,
  unitsUsed: 3,
  proofs: [{ kind: 'log', ref: 'local-demo' }],
  idempotencyKey: 'idem_usage_demo_001'
};

const r3 = await fetch(`${baseUrl}/v1/usage/record`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(usageBody)
});
const usage = await r3.json();
console.log('usage', usage);

const r4 = await fetch(`${baseUrl}/v1/receipt/${usage.receiptId}`);
const receipt = await r4.json();
console.log('receipt', receipt);
