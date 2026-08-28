#!/usr/bin/env node

import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

// Note: Using standard console colors instead of chalk to keep the build simple for now.
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;

const COMMON_SUBSCRIPTIONS = {
    'BRIGHTDATA': { name: 'Premium Proxy Service', estMonthlyCost: 250 },
    'PINECONE': { name: 'Vector Database (Fixed)', estMonthlyCost: 70 },
    'HELICONE': { name: 'LLM Observability', estMonthlyCost: 50 },
    'DATADOG': { name: 'Infrastructure Monitoring', estMonthlyCost: 150 },
    'ALCHEMY': { name: 'RPC Provider', estMonthlyCost: 49 }
};

program
  .name('waste-scanner')
  .description('Scans an AI agent codebase to calculate wasted SaaS subscription costs.')
  .argument('[dir]', 'Directory to scan', '.')
  .action((dir) => {
    console.log(`\n🔍 Scanning ${path.resolve(dir)} for fixed-cost SaaS bloat...\n`);
    
    let totalWaste = 0;
    const foundServices: string[] = [];

    // Simple recursive search for .env files
    const scanDir = (currentPath: string) => {
      if (!fs.existsSync(currentPath)) return;
      const files = fs.readdirSync(currentPath);
      
      for (const file of files) {
        if (file === 'node_modules' || file === '.git') continue;
        
        const fullPath = path.join(currentPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (file === '.env' || file === '.env.example') {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          for (const [key, details] of Object.entries(COMMON_SUBSCRIPTIONS)) {
            if (content.includes(key) && !foundServices.includes(details.name)) {
              foundServices.push(details.name);
              totalWaste += details.estMonthlyCost;
              console.log(`${red('✖')} Found ${yellow(details.name)} subscription (Est. $${details.estMonthlyCost}/mo)`);
            }
          }
        }
      }
    };

    scanDir(dir);

    console.log('\n=======================================');
    if (totalWaste > 0) {
      console.log(`🩸 ${red('TOTAL ESTIMATED MONTHLY BURN: $' + totalWaste)}`);
      console.log(`\n💡 ${green('AgentPay Solution:')}`);
      console.log(`Switch to AgentPay's HTTP 402 micro-billing.`);
      console.log(`Pay $0.005 per request. $0 monthly fixed costs.`);
      console.log(`Run 'npx @agentpay/eliza-plugin install' to stop the bleed.`);
    } else {
      console.log(`✅ ${green('No obvious SaaS bloat found.')} Your agent is lean!`);
    }
    console.log('=======================================\n');
  });

program.parse();
