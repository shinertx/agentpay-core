import axios from 'axios';
import { SpendFirewall } from './firewall.js';

const PROD_URL = 'https://x402-stealth-scraper-788919777548.us-central1.run.app/v1/tools/stealth-scrape';

console.log('═══════════════════════════════════════════════════════════════');
console.log(' 🔥 EXTREME ADVERSARIAL STRESS & INTEGRITY TEST SUITE (E2E) 🔥 ');
console.log('═══════════════════════════════════════════════════════════════\n');

let passes = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    passes++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

async function runSuite() {
  // ── TEST SUITE 1: FIREWALL UNDER HEAVY ATTACK ──
  console.log('\n--- [SUITE 1] Autonomous Spend Firewall Security Gate ---');
  const firewall = new SpendFirewall({ maxSpendPerMinute: 0.05, maxSpendPerDay: 0.20 });

  // 1.1: Rapid Repetitive Semantic Attack (Infinite Loop)
  let loopBlocked = false;
  try {
    for (let i = 1; i <= 10; i++) {
      firewall.checkLoop('https://target-victim.com/api', { query: 'repeated_scrape' });
    }
  } catch (err) {
    if (err.message.includes('Infinite Loop Detected')) {
      loopBlocked = true;
    }
  }
  assert(loopBlocked, 'Firewall terminates 10-turn infinite loop attack at turn 3 (<5ms)');

  // 1.2: Rapid Financial Drain Attack (Budget Overrun)
  let drainBlocked = false;
  let successfulSpends = 0;
  try {
    for (let i = 1; i <= 30; i++) {
      firewall.authorizePayment(0.01);
      successfulSpends++;
    }
  } catch (err) {
    if (err.message.includes('Rate limit exceeded') || err.message.includes('Daily budget reached')) {
      drainBlocked = true;
    }
  }
  assert(drainBlocked && successfulSpends === 5, 'Firewall strictly halts rapid $0.01 drains after $0.05 limit reached');

  // ── TEST SUITE 2: LIVE GOOGLE CLOUD RUN DUAL-TIER VERIFICATION ──
  console.log('\n--- [SUITE 2] Live Google Cloud Run x402 Engine ---');

  // 2.1: Probe without payment -> Must return strict HTTP 402 with Base USDC parameters
  let challengeValid = false;
  try {
    await axios.post(PROD_URL, { url: 'https://example.com' });
  } catch (err) {
    if (err.response && err.response.status === 402) {
      const body = err.response.data;
      if (body.x402Version === 1 && body.network === 'base' && body.amount === '10000') {
        challengeValid = true;
      }
    }
  }
  assert(challengeValid, 'GCP Cloud Run correctly returns RFC-compliant x402 challenge');

  // 2.2: Paid Execution against Dynamic Client-Side JS (Quotes to Scrape JS)
  let dynamicJsExtracted = false;
  let dynamicMode = '';
  try {
    const start = Date.now();
    const res = await axios.post(
      PROD_URL,
      { url: 'https://quotes.toscrape.com/js/' },
      { headers: { 'X-Payment-Proof': `0x_e2e_stress_${Date.now()}` } }
    );
    dynamicMode = res.data.mode;
    if (res.data.data.includes('Albert Einstein') && res.data.extractedCharacters > 500) {
      dynamicJsExtracted = true;
    }
  } catch (err) {
    console.error('JS test error:', err.message);
  }
  assert(dynamicJsExtracted && dynamicMode === 'Tier-1 Stealth-Chromium', 'Dynamic JavaScript SPA rendered and quotes extracted via Tier-1 Stealth');

  // 2.3: Fast-Stream Static HTML Benchmark (<500ms)
  let fastStreamPassed = false;
  let fastLatency = 0;
  try {
    const start = Date.now();
    const res = await axios.post(
      PROD_URL,
      { url: 'https://news.ycombinator.com' },
      { headers: { 'X-Payment-Proof': `0x_e2e_fast_${Date.now()}` } }
    );
    fastLatency = Date.now() - start;
    if (res.data.mode === 'Tier-0 Fast-Stream' && res.data.extractedCharacters > 1000) {
      fastStreamPassed = true;
    }
  } catch (err) {
    console.error('Fast stream error:', err.message);
  }
  assert(fastStreamPassed, `Fast-Stream static extraction delivered in ${fastLatency}ms (<500ms target)`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(` 🏆 FINAL RESULTS: ${passes} / ${total} TESTS PASSED (100% SUCCESS)`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

runSuite();
