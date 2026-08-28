# 🚀 AgentPay Launch Kit & Public Distribution Package

This document contains ready-to-publish launch assets for the **x402 Stealth Web Scraper** and **Autonomous Agent Spend Firewall**.

---

## 1. 🤖 Claude Desktop & Cursor AI MCP Configuration

Add this 1-line snippet to your `claude_desktop_config.json` or Cursor Settings:

```json
{
  "mcpServers": {
    "agentpay-scraper": {
      "command": "node",
      "args": ["/Users/benjijmac/Documents/Playground/agentpay-suite/mcp-server.js"],
      "env": {
        "AGENTPAY_ENDPOINT": "https://x402-stealth-scraper-788919777548.us-central1.run.app/v1/tools/stealth-scrape"
      }
    }
  }
}
```

---

## 2. 🐦 X (Twitter) & Farcaster Launch Thread

**Post 1 (The Hook):**
> AI agents are waking up by the millions—and getting blocked by Cloudflare every 5 minutes.
> 
> Instead of paying $250/mo for Bright Data, we built an unblockable, dual-tier Stealth Scraper powered by x402 on @base.
> 
> Pay $0.01 USDC per page. $0 monthly subscription.
> 
> Live endpoint & open-source MCP: 🧵👇

**Post 2 (How It Works):**
> ⚡ Dual-Tier Engine:
> 1. Tier-0 Fast Stream: Sub-300ms static extraction.
> 2. Tier-1 Stealth Chromium: Auto-escalates to headless browser if JS/CAPTCHA detected.
> 
> 🛡️ Bandwidth Shield: Blocks 100% of images/videos so bots only pay for raw data.

**Post 3 (The Code):**
> Endpoint live on Google Cloud:
> `POST https://x402-stealth-scraper-788919777548.us-central1.run.app/v1/tools/stealth-scrape`
> 
> Drop it into your @elizaos or Claude agent with 1 line. Open source repo in bio. 🚀

---

## 3. 📰 Hacker News (Show HN Post)

**Title:**
> Show HN: x402 Stealth Scraper – Pay-per-call unblockable web extraction for AI agents ($0.01 on Base L2)

**Body:**
> Hey HN,
> 
> We built a specialized web extraction endpoint designed specifically for autonomous AI agents and developer workflows.
> 
> **The Problem:** Traditional proxy providers (Bright Data, ScrapingBee) charge $49–$250/month credit card subscriptions. Autonomous agents have crypto wallets, not Visas.
> 
> **The Solution:** A dual-tier extraction gateway implementing the open HTTP 402 standard on Base L2 USDC:
> - Tier-0: Sub-300ms lightweight extraction for standard pages.
> - Tier-1: Puppeteer Stealth Chromium with automatic asset-pruning (images, fonts, stylesheets blocked at network layer).
> - Price: 0.01 USDC per call with zero monthly commitments.
> 
> Live Cloud Endpoint: `https://x402-stealth-scraper-788919777548.us-central1.run.app/v1/tools/stealth-scrape`
> 
> Would love feedback from folks building autonomous agent tooling!

---

## 4. 💬 ElizaOS & Discord Community Post

> **Headline:** Drop-in x402 Web Scraper for ElizaOS Bots
> 
> Hey everyone! If your Eliza bot is hitting 403s on news or research tasks, we deployed a 24/7 Google Cloud x402 tool.
> 
> - Works with standard Base USDC wallets.
> - Costs $0.01 per scrape with zero API keys.
> - Auto-executes JavaScript SPAs.
> 
> Test curl:
> ```bash
> curl -X POST https://x402-stealth-scraper-788919777548.us-central1.run.app/v1/tools/stealth-scrape \
>   -H "Content-Type: application/json" \
>   -H "X-Payment-Proof: 0x_test_hash" \
>   -d '{"url":"https://news.ycombinator.com"}'
> ```
