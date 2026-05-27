/**
 * Screenshot capture script for MacroMatch
 *
 * Requires a running instance of the app and a seeded test account.
 * Set TEST_EMAIL and TEST_PASSWORD env vars before running.
 *
 * Usage:
 *   npm install playwright (one-time)
 *   npx playwright install chromium (one-time)
 *   TEST_EMAIL=you@example.com TEST_PASSWORD=yourpass node scripts/capture-screenshots.mjs
 *
 * Outputs all screenshots to .github/assets/screenshots/
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../.github/assets/screenshots');
const BASE_URL = process.env.APP_URL || 'http://localhost:5173';
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Set TEST_EMAIL and TEST_PASSWORD environment variables.');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

async function shot(page, filename) {
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: join(OUT_DIR, filename), fullPage: false });
  console.log('captured:', filename);
}

// --- Desktop (1440x900) ---
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Login page
await page.goto(`${BASE_URL}/login`);
await shot(page, 'auth-login.png');

// Log in
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL(`${BASE_URL}/`);

// Pantry dashboard
await shot(page, 'dashboard-pantry.png');

// Low-stock alert panel — visible on the same page, just crop-focus via scroll
await page.evaluate(() => window.scrollTo(0, 0));
await shot(page, 'dashboard-low-stock.png');

// Generator — form
await page.goto(`${BASE_URL}/generate`);
await page.waitForLoadState('networkidle');
await shot(page, 'generator-form.png');

// Generator — LP results (fill form and submit)
await page.fill('input[name="targetProtein"]', '35');
await page.fill('input[name="targetCarbs"]', '60');
await page.fill('input[name="targetFats"]', '20');
await page.click('button[type="submit"]');
await page.waitForSelector('.meal-plan-card, [data-testid="meal-card"]', { timeout: 10000 }).catch(() => {});
await page.waitForTimeout(800);
await shot(page, 'generator-results.png');

// Generator — shopping list
await page.click('button:has-text("Build Shopping List")');
await page.waitForTimeout(1200);
await shot(page, 'generator-shopping.png');

// Analytics dashboard
await page.goto(`${BASE_URL}/dashboard`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(600);
await shot(page, 'analytics-macro-trends.png');
await shot(page, 'analytics-pantry-distribution.png');

// History
await page.goto(`${BASE_URL}/history`);
await page.waitForLoadState('networkidle');
await shot(page, 'history.png');

// Recipes
await page.goto(`${BASE_URL}/recipes`);
await page.waitForLoadState('networkidle');
await shot(page, 'recipes.png');

await ctx.close();

// --- Mobile (390x844) ---
const mCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mPage = await mCtx.newPage();

await mPage.goto(`${BASE_URL}/login`);
await mPage.fill('input[type="email"]', EMAIL);
await mPage.fill('input[type="password"]', PASSWORD);
await mPage.click('button[type="submit"]');
await mPage.waitForURL(`${BASE_URL}/`);
await mPage.waitForLoadState('networkidle');
await shot(mPage, 'dashboard-mobile-390.png');

await mCtx.close();
await browser.close();

console.log(`\nAll screenshots saved to ${OUT_DIR}`);
