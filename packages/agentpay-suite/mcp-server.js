#!/usr/bin/env node

/**
 * @agentpay/scraper-mcp
 * Official Model Context Protocol (MCP) Server for x402 Stealth Web Scraping
 * Compatible with Claude Desktop, Cursor AI, and ElizaOS
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const PROD_ENDPOINT = process.env.AGENTPAY_ENDPOINT || "https://x402-stealth-scraper-788919777548.us-central1.run.app/v1/tools/stealth-scrape";

const server = new Server(
  {
    name: "agentpay-stealth-scraper",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define Tool Definition
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "stealth_scrape",
        description: "Extract clean, unblocked text content from any website or dynamic JavaScript page using x402 Base USDC micropayments.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The full target URL to extract text from (e.g. https://news.ycombinator.com)",
            },
            forceStealth: {
              type: "boolean",
              description: "Force Tier-1 Puppeteer Stealth Chromium execution even for static pages.",
            }
          },
          required: ["url"],
        },
      },
    ],
  };
});

// Handle Tool Call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "stealth_scrape") {
    const { url, forceStealth } = request.params.arguments;
    const paymentProof = process.env.X402_PAYMENT_PROOF || `0x_mcp_client_${Date.now()}`;

    try {
      const response = await axios.post(
        PROD_ENDPOINT,
        { url, forceStealth },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Payment-Proof": paymentProof,
          },
          timeout: 20000,
        }
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error.response && error.response.status === 402) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Payment Required (x402): Please provide a valid Base USDC payment proof header.\nDetails: ${JSON.stringify(error.response.data)}`,
            },
          ],
        };
      }

      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Scrape error: ${error.message}`,
          },
        ],
      };
    }
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 AgentPay MCP Stealth Scraper Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
