// Phase 2 browser checks for the Claude build (site/): clickable PFD, P9 and P10.
// Usage: node tests/browser-phase2.mjs --base http://localhost:8000 --out <dir>
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') && a.push([x.slice(2), arr[i + 1]]), a), []));
const BASE = (args.base || 'http://localhost:8000').replace(/\/$/, '');
const OUT = args.out || 'docs/screenshots/verification/phase2';
const SCHEME = args.scheme === 'dark' ? 'dark' : 'light';   // --scheme dark: device prefers dark (site follows it)
mkdirSync(OUT, { recursive: true });

const failures = [];
const fail = (m) => failures.push(m);
const browser = await chromium.launch();

for (const vp of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 375, height: 812 }]) {
  const page = await browser.newPage({ colorScheme: SCHEME,  viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(`${BASE}/#simulator`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // P9 and P10 render
  for (const id of ['p9', 'p10']) {
    const ok = await page.$eval(`#${id}`, (el) => !!el.querySelector('.main-svg')).catch(() => false);
    if (!ok) fail(`${vp.name}: chart #${id} not rendered`);
  }
  const sig = (id) => page.$eval(`#${id}`, (el) => JSON.stringify(el.data || [])).catch(() => '');

  // U changes P9; load fraction changes P10
  for (const [slider, chart] of [['U', 'p9'], ['loadFraction', 'p10'], ['interest', 'p9']]) {
    const before = await sig(chart);
    const moved = await page.$eval(`#in-${slider}`, (el) => {
      const min = +el.min, max = +el.max;
      el.value = String(+el.value + (max - min) * 0.3 <= max ? +el.value + (max - min) * 0.3 : +el.value - (max - min) * 0.3);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }).catch(() => false);
    if (!moved) { fail(`${vp.name}: slider #in-${slider} missing`); continue; }
    await page.waitForTimeout(500);
    if ((await sig(chart)) === before) fail(`${vp.name}: moving ${slider} did not change #${chart}`);
  }

  // Clickable PFD: every unit opens a panel with KaTeX equations and no NaN
  const units = await page.$$eval('#pfd [data-unit]', (els) => els.map((e) => e.getAttribute('data-unit')));
  if (units.length < 5) fail(`${vp.name}: expected >= 5 clickable PFD units, found ${units.length}`);
  for (const u of units) {
    await page.locator(`#pfd [data-unit="${u}"]`).first().click();
    await page.waitForTimeout(300);
    const p = await page.$eval('#pfd-panel', (el) => ({
      visible: !!(el.offsetParent || el.getClientRects().length),
      katex: el.querySelectorAll('.katex').length,
      bad: /NaN|undefined|Infinity/.test(el.innerText),
      err: el.querySelectorAll('.katex-error').length,
    })).catch(() => null);
    if (!p || !p.visible) { fail(`${vp.name}: panel not shown for unit "${u}"`); continue; }
    if (!p.katex) fail(`${vp.name}: panel for "${u}" has no equations`);
    if (p.err) fail(`${vp.name}: panel for "${u}" has KaTeX errors`);
    if (p.bad) fail(`${vp.name}: panel for "${u}" shows NaN/undefined`);
  }
  // keyboard: Enter opens a unit
  if (units.length) {
    await page.locator(`#pfd [data-unit="${units[0]}"]`).first().focus();
    await page.keyboard.press('Enter');
  }
  await page.locator('#pfd').scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(OUT, `${vp.name}-pfd-panel.png`), fullPage: false });
  for (const id of ['p9', 'p10']) {
    const el = await page.$(`#${id}`);
    if (el) { await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: join(OUT, `${vp.name}-${id}.png`) }); }
  }
  const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (sw > 1) fail(`${vp.name}: horizontal scroll (${sw}px)`);
  if (errors.length) fail(`${vp.name}: ${errors.length} console errors: ${errors.slice(0, 3).join(' | ')}`);
  await page.close();
}
await browser.close();

const report = failures.length ? failures.map((f) => `- ❌ ${f}`).join('\n') : '- ✅ all Phase 2 browser checks passed';
writeFileSync(join(OUT, 'report.md'), `# Phase 2 browser checks\n\n${report}\n`);
console.log(report);
process.exit(failures.length ? 1 : 0);
