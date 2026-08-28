import axios from 'axios';
import { SpendFirewall } from './firewall.js';

// Initialize Firewall with strict agent budget
const firewall = new SpendFirewall({ maxSpendPerMinute: 0.05, maxSpendPerDay: 1.00 });

async function executeAgentToolCall(targetUrl) {
  console.log(`\n🤖 [AI Agent] Requesting data for: ${targetUrl}`);

  // Step 1: Firewall Loop Inspection
  try {
    firewall.checkLoop(targetUrl, {});
  } catch (err) {
    console.error(err.message);
    return;
  }

  // Step 2: Unauthenticated Probe
  try {
    const res = await axios.post('http://localhost:3010/v1/tools/stealth-scrape', { url: targetUrl });
    console.log('✅ Unpaid access granted:', res.data);
  } catch (err) {
    if (err.response && err.response.status === 402) {
      const challenge = err.response.data;
      console.log(`⚠️ HTTP 402 Intercepted! Price: ${challenge.amount / 1000000} USDC on ${challenge.network}`);

      const costInUSDC = challenge.amount / 1000000;

      // Step 3: Firewall Spend Authorization Gate
      try {
        firewall.authorizePayment(costInUSDC);
        console.log(`🛡️ Firewall Approved: $${costInUSDC} USDC authorized.`);
      } catch (firewallErr) {
        console.error(firewallErr.message);
        return;
      }

      // Step 4: Autonomous Settlement & Retry
      const mockTxProof = `0x_base_tx_sig_${Date.now()}`;
      console.log(`💸 Signing & Transmitting payment proof...`);

      const paidRes = await axios.post('http://localhost:3010/v1/tools/stealth-scrape', 
        { url: targetUrl },
        { headers: { 'X-Payment-Proof': mockTxProof } }
      );

      console.log(`🎉 SUCCESS! Paid tool executed:`);
      console.log(`📄 Title: ${paidRes.data.url}`);
      console.log(`📦 Characters Extracted: ${paidRes.data.extractedCharacters}`);
      console.log(`💰 Receipt: ${paidRes.data.x402Receipt.cost}`);
    } else {
      console.error('Execution error:', err.message);
    }
  }
}

// Test 1: Normal Authorized Execution
await executeAgentToolCall('https://news.ycombinator.com');
