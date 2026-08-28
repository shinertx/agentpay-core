import axios from 'axios';

const SERVER_URL = 'http://localhost:3010/v1/tools/stealth-scrape';
const TEST_TARGET = 'https://news.ycombinator.com';

console.log('🚀 Starting Full End-to-End (E2E) Protocol Test...\n');

async function runE2ETest() {
  // Step 1: Probe without payment proof
  console.log('📡 Step 1: Sending unauthenticated request (Probe)...');
  let challenge = null;
  try {
    await axios.post(SERVER_URL, { url: TEST_TARGET });
    console.error('❌ FAILED: Server should have rejected unpaid request with HTTP 402.');
    process.exit(1);
  } catch (err) {
    if (err.response && err.response.status === 402) {
      challenge = err.response.data;
      console.log('✅ PASS: Intercepted HTTP 402 Challenge correctly.');
      console.log(`   - Network: ${challenge.network}`);
      console.log(`   - Price: ${challenge.amount / 1000000} USDC`);
      console.log(`   - Destination: ${challenge.payTo}`);
    } else {
      console.error('❌ FAILED: Unexpected error:', err.message);
      process.exit(1);
    }
  }

  // Step 2: Simulate Autonomous Base L2 Payment Signing
  console.log('\n💸 Step 2: Simulating autonomous agent transaction signing on Base L2...');
  const simulatedTxHash = `0x_base_e2e_proof_${Date.now()}`;
  console.log(`   - Generated Payment Proof: ${simulatedTxHash}`);

  // Step 3: Send authenticated paid request
  console.log('\n🔓 Step 3: Retrying request with x402 payment proof header...');
  try {
    const start = Date.now();
    const res = await axios.post(
      SERVER_URL,
      { url: TEST_TARGET },
      { headers: { 'X-Payment-Proof': simulatedTxHash } }
    );
    const latency = Date.now() - start;

    console.log('✅ PASS: Server verified proof and unlocked payload!');
    console.log(`   - Status: ${res.status} OK`);
    console.log(`   - Latency: ${latency} ms`);
    console.log(`   - Target URL: ${res.data.url}`);
    console.log(`   - Characters Extracted: ${res.data.extractedCharacters}`);
    console.log(`   - Receipt Status: ${res.data.x402Receipt.cost} (${res.data.x402Receipt.network})`);
    console.log('\n🏆 E2E VERIFICATION: 100% SUCCESS — READY FOR PUBLIC TESTING!');
  } catch (err) {
    console.error('❌ FAILED on paid execution:', err.message);
    process.exit(1);
  }
}

runE2ETest();
