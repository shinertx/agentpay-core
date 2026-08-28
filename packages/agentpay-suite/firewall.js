/**
 * 🛡️ The Autonomous Spend Firewall
 * Protects AI agent wallets from infinite loops, budget overflows, and prompt-injection drains.
 */
export class SpendFirewall {
  constructor(config = {}) {
    this.maxSpendPerMinute = config.maxSpendPerMinute || 0.05; // $0.05 max / min
    this.maxSpendPerDay = config.maxSpendPerDay || 2.00;       // $2.00 max / day
    this.history = [];
    this.semanticHistory = [];
  }

  // 1. Semantic Loop Detection (Flags repetitive queries)
  checkLoop(targetUrl, payload) {
    const signature = `${targetUrl}:${JSON.stringify(payload)}`;
    const recentSimilar = this.semanticHistory.filter(h => h.signature === signature && Date.now() - h.timestamp < 30000);
    
    if (recentSimilar.length >= 3) {
      throw new Error(`🚨 FIREWALL BLOCKED: Infinite Loop Detected! Target '${targetUrl}' called 3+ times in 30s.`);
    }

    this.semanticHistory.push({ signature, timestamp: Date.now() });
  }

  // 2. Spend Limit Enforcement
  authorizePayment(amountUSDC) {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneDayAgo = now - 86400000;

    const recentSpend = this.history
      .filter(tx => tx.timestamp > oneMinuteAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const dailySpend = this.history
      .filter(tx => tx.timestamp > oneDayAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (recentSpend + amountUSDC > this.maxSpendPerMinute) {
      throw new Error(`🚨 FIREWALL BLOCKED: Rate limit exceeded ($${(recentSpend + amountUSDC).toFixed(4)} > $${this.maxSpendPerMinute}/min).`);
    }

    if (dailySpend + amountUSDC > this.maxSpendPerDay) {
      throw new Error(`🚨 FIREWALL BLOCKED: Daily budget reached ($${(dailySpend + amountUSDC).toFixed(4)} > $${this.maxSpendPerDay}/day).`);
    }

    // Record verified spend
    this.history.push({ amount: amountUSDC, timestamp: now });
    return true;
  }
}
