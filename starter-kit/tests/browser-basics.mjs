// Basics every page of the site should keep: theme + motion toggles (remembered), dropdowns, phone
// layout (no horizontal scroll, no zoom-out, header on one row), no console errors.
// Usage: node tests/browser-basics.mjs --base http://localhost:8000 --out <dir>
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') && a.push([x.slice(2), arr[i + 1]]), a), []));
const BASE = (args.base || 'http://localhost:8000').replace(/\/$/, '');
const OUT = args.out || 'test-results/basics';
mkdirSync(OUT, { recursive: true });
const failures = [];
const fail = (m) => failures.push(m);
const browser = await chromium.launch();

// desktop: toggles remembered, every dropdown opens, no console errors
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  if (await page.evaluate(() => document.documentElement.dataset.theme) !== 'light') fail('theme should follow the device (light)');
  await page.click('#theme-toggle');
  await page.reload({ waitUntil: 'networkidle' });
  if (await page.evaluate(() => document.documentElement.dataset.theme) !== 'dark') fail('theme choice not remembered');
  await page.click('#motion-toggle');
  await page.reload({ waitUntil: 'networkidle' });
  if (await page.evaluate(() => document.documentElement.dataset.motion) !== 'off') fail('motion choice not remembered');
  const tabs = await page.$$eval('.tabs a', (as) => as.map((a) => a.dataset.tab));
  for (const t of tabs) {
    await page.evaluate((x) => { location.hash = `#${x}`; }, t);
    await page.waitForTimeout(250);
    for (const el of await page.$$(`#tab-${t} details`)) {
      await el.evaluate((x) => x.querySelector('summary').click());
      if (!(await el.evaluate((x) => x.open))) fail(`#${t}: a dropdown did not open`);
    }
  }
  if (errors.length) fail(`console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// phones: every tab fits (no zoom-out), header stays on one row
for (const width of [375, 320]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const tabs = await page.$$eval('.tabs a', (as) => as.map((a) => a.dataset.tab));
  for (const t of tabs) {
    await page.evaluate((x) => { location.hash = `#${x}`; }, t);
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => ({ iw: innerWidth, sw: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    if (m.iw > width + 1 || m.sw > 1) fail(`${width}px #${t}: too wide (innerWidth ${m.iw}, scroll ${m.sw}px); the phone would zoom out`);
  }
  const row = await page.evaluate(() => {
    const a = document.getElementById('theme-toggle').getBoundingClientRect();
    const b = document.getElementById('motion-toggle').getBoundingClientRect();
    return Math.abs(a.top - b.top) < 2;
  });
  if (!row) fail(`${width}px: header buttons wrapped onto two rows`);
  await page.screenshot({ path: join(OUT, `phone-${width}.png`), fullPage: true });
  await ctx.close();
}

await browser.close();
const report = failures.length ? failures.map((f) => `- ❌ ${f}`).join('\n') : '- ✅ all basics checks passed';
writeFileSync(join(OUT, 'report.md'), `# Basics\n\n${report}\n`);
console.log(report);
process.exit(failures.length ? 1 : 0);
