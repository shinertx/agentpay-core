import { SpendFirewall } from './firewall.js';

console.log('🧪 Testing Autonomous Spend Firewall Under Attack / Runaway Loop...\n');
const firewall = new SpendFirewall({ maxSpendPerMinute: 0.02, maxSpendPerDay: 1.00 });

// Attack 1: Infinite Loop Check
console.log('--- Test 1: Rapid Repetitive Calls (Loop Detection) ---');
try {
  firewall.checkLoop('https://example.com', {});
  console.log('Call 1: Passed');
  firewall.checkLoop('https://example.com', {});
  console.log('Call 2: Passed');
  firewall.checkLoop('https://example.com', {});
  console.log('Call 3: Passed');
  firewall.checkLoop('https://example.com', {});
  console.log('Call 4: Passed');
} catch (err) {
  console.log(err.message);
}

// Attack 2: Wallet Drain Cap Check
console.log('\n--- Test 2: Budget Overflow Protection ---');
try {
  firewall.authorizePayment(0.01);
  console.log('Payment 1 ($0.01): Approved');
  firewall.authorizePayment(0.01);
  console.log('Payment 2 ($0.01): Approved');
  firewall.authorizePayment(0.01); // Exceeds $0.02/min limit!
  console.log('Payment 3 ($0.01): Approved');
} catch (err) {
  console.log(err.message);
}
