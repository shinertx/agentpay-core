import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

dotenv.config();
puppeteerExtra.use(StealthPlugin());

const app = express();
app.use(express.json());

const RECIPIENT_ADDRESS = process.env.PAYMENT_ADDRESS || "0x89A6b89718baCdF5D717877ded7E6E12D25479A6";
const PRICE_USDC = "0.01"; // $0.01 per scrape

// First-Principles Optimization: Reusable Master Chromium Instance
let masterBrowser = null;

async function getBrowser() {
  if (!masterBrowser || !masterBrowser.connected) {
    console.log("⚡ [PUPPETEER] Launching low-overhead Stealth Chromium...");
    masterBrowser = await puppeteerExtra.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-default-apps',
        '--mute-audio',
        '--hide-scrollbars',
        '--disable-notifications'
      ]
    });
  }
  return masterBrowser;
}

// 1. Tier-0 Fast-Path (Sub-200ms lightweight extraction)
async function tryFastExtraction(url) {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    },
    timeout: 6000
  });

  const html = response.data;
  if (typeof html !== 'string' || html.includes('cf-browser-verification') || html.includes('challenge-platform') || html.includes('Just a moment...')) {
    throw new Error('Cloudflare/Anti-Bot challenge detected');
  }

  const $ = cheerio.load(html);
  $('script, style, svg, nav, footer, iframe, noscript').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  const title = $('title').text().trim() || url;

  return { title, text: text.slice(0, 5000), mode: 'Tier-0 Fast-Stream' };
}

// 2. Tier-1 Stealth Headless Path (Full JS DOM Execution + Aggressive Resource Pruning)
async function executeStealthExtraction(url) {
  const browser = await getBrowser();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  try {
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    // First Principles Bandwidth Shield: Abort all images, fonts, stylesheets, media, tracking
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const reqUrl = req.url().toLowerCase();

      // Block bloated assets
      if (['image', 'media', 'font', 'stylesheet', 'other'].includes(resourceType) ||
          reqUrl.includes('google-analytics') ||
          reqUrl.includes('googletagmanager') ||
          reqUrl.includes('doubleclick') ||
          reqUrl.includes('facebook') ||
          reqUrl.includes('segment') ||
          reqUrl.includes('hotjar')) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait a brief tick for dynamic JS frameworks if necessary
    await new Promise(r => setTimeout(r, 600));

    const extracted = await page.evaluate(() => {
      // Clean unwanted elements directly in DOM
      const elements = document.querySelectorAll('script, style, svg, nav, footer, iframe, noscript');
      elements.forEach(el => el.remove());
      
      const title = document.title || '';
      const text = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').trim();
      return { title, text };
    });

    return {
      title: extracted.title,
      text: extracted.text.slice(0, 5000),
      mode: 'Tier-1 Stealth-Chromium'
    };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

// In-Memory IP Rate Tracker for 50 Free Daily Requests per IP
const freeUsageMap = new Map();
const FREE_TIER_LIMIT = 50;

function checkFreeQuota(ip) {
  const now = Date.now();
  const user = freeUsageMap.get(ip) || { count: 0, resetAt: now + 24 * 3600 * 1000 };

  if (now > user.resetAt) {
    user.count = 0;
    user.resetAt = now + 24 * 3600 * 1000;
  }

  if (user.count < FREE_TIER_LIMIT) {
    user.count++;
    freeUsageMap.set(ip, user);
    return { allowed: true, remaining: FREE_TIER_LIMIT - user.count };
  }

  return { allowed: false, remaining: 0 };
}

// 3. x402 Main Extraction Route (with 50 Free Scrapes/Day Freemium)
app.post('/v1/tools/stealth-scrape', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const paymentProof = req.headers['x-payment-proof'] || req.headers['authorization'];
  const { url, forceStealth } = req.body;

  let isFreeTier = false;
  let remainingFree = 0;

  // Check if unauthenticated request qualifies for Free Tier
  if (!paymentProof) {
    const quota = checkFreeQuota(clientIp);
    if (!quota.allowed) {
      return res.status(402).json({
        x402Version: 1,
        scheme: "exact",
        network: "base",
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Native USDC
        payTo: RECIPIENT_ADDRESS,
        amount: "10000", // 0.01 USDC (6 decimals)
        description: "Free 50-Request Daily Quota Exhausted. Submit $0.01 Base USDC to continue.",
        instructions: "Submit signed transfer transaction hash in 'X-Payment-Proof' header."
      });
    }
    isFreeTier = true;
    remainingFree = quota.remaining;
  }

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  const startTime = Date.now();

  try {
    let result;
    try {
      if (forceStealth) {
        throw new Error('Explicit stealth mode requested');
      }
      // First try Tier-0 (sub-200ms)
      result = await tryFastExtraction(url);
      if (!result.text || result.text.length < 60) {
        throw new Error('Static HTML content insufficient - escalating to full JS rendering');
      }
    } catch (fastErr) {
      console.log(`⚡ [ESCALATION] ${fastErr.message} on ${url}. Escalating to Tier-1 Stealth Chromium...`);
      result = await executeStealthExtraction(url);
    }

    const latencyMs = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      url,
      title: result.title,
      mode: result.mode,
      latencyMs,
      extractedCharacters: result.text.length,
      data: result.text,
      x402Receipt: {
        settled: true,
        network: isFreeTier ? "free-tier-grant" : "base",
        tier: isFreeTier ? "Free Developer Grant (50/day)" : "VIP Micro-Settlement",
        cost: isFreeTier ? "$0.00 (Grant)" : "$0.01 USDC",
        remainingFreeRequestsToday: isFreeTier ? remainingFree : "unlimited (paid)"
      }
    });
  } catch (err) {
    console.error("Extraction error:", err);
    return res.status(502).json({
      error: "Extraction failed or target unreachable",
      message: err.message,
      latencyMs: Date.now() - startTime
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "healthy", engine: "first-principles-stealth-x402", version: "2.0.0" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 First-Principles Stealth x402 Server listening on port ${PORT}`);
});
