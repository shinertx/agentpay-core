import { Plugin, Provider, AgentRuntime, State, Memory } from "@elizaos/core";

// 1. The Wallet Provider (Injects Balance)
export const agentPayWalletProvider: Provider = {
    get: async (runtime: AgentRuntime, message: Memory, state?: State) => {
        // TODO: Fetch real USDC balance from Base/Solana
        const balance = 50.00;
        const dailyAllowance = 5.00;
        const spentToday = 1.25;

        return `[AgentPay Wallet]
Balance: $${balance} USDC
Daily Allowance: $${dailyAllowance} USDC
Spent Today: $${spentToday} USDC
Remaining Allowance: $${dailyAllowance - spentToday} USDC`;
    }
};

// 2. The Auto-Spender & Circuit Breaker Interceptor
export class AgentPayInterceptor {
    private dailyAllowance: number;
    private spentToday: number;

    constructor(allowance: number = 5.00) {
        this.dailyAllowance = allowance;
        this.spentToday = 0;
    }

    async fetch(url: string, options?: RequestInit): Promise<Response> {
        // Make the initial request
        let response = await fetch(url, options);

        // Intercept HTTP 402 Payment Required
        if (response.status === 402) {
            const invoiceAmount = parseFloat(response.headers.get("X-Invoice-Amount") || "0");
            
            // 3. Circuit Breaker Logic
            if (this.spentToday + invoiceAmount > this.dailyAllowance) {
                throw new Error(`[AgentPay Circuit Breaker] Cannot pay $${invoiceAmount}. Exceeds daily allowance.`);
            }

            console.log(`[AgentPay] Intercepted 402. Paying invoice for $${invoiceAmount} USDC...`);
            
            // TODO: Execute actual blockchain transaction here
            this.spentToday += invoiceAmount;
            
            // Retry the request with the payment proof (mocked)
            const newOptions = {
                ...options,
                headers: {
                    ...options?.headers,
                    "Authorization": "Bearer tx_mock_receipt_123"
                }
            };
            response = await fetch(url, newOptions);
        }

        return response;
    }
}

// Export the official ElizaOS Plugin
export const agentPayPlugin: Plugin = {
    name: "agentpay",
    description: "Enables autonomous M2M micro-payments via AgentPay",
    providers: [agentPayWalletProvider],
    actions: [], // Actions can be added later for explicit tipping/payments
    evaluators: []
};

export default agentPayPlugin;
