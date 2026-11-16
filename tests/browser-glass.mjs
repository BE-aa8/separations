// Liquid Glass simulator checks: clean default view, Explain switch, Help panel, key-result tiles,
// grouped charts, mobile Inputs sheet. Presentation only; physics is covered by npm test.
// Usage: node tests/browser-glass.mjs --base http://localhost:8000 --out <dir> [--scheme dark]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') && a.push([x.slice(2), arr[i + 1]]), a), []));
const BASE = (args.base || 'http://localhost:8000').replace(/\/$/, '');
const OUT = args.out || 'docs/screenshots/verification/glass';
const SCHEME = args.scheme === 'dark' ? 'dark' : 'light';
mkdirSync(OUT, { recursive: true });
const failures = [];
const fail = (m) => failures.push(m);
const browser = await chromium.launch();
const watch = (page, errors) => {
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
};
const words = (page) => page.evaluate(() => document.querySelector('#tab-simulator').innerText.trim().split(/\s+/).length);
const visible = (page, sel) => page.$$eval(sel, (els) => els.filter((e) => e.offsetParent || e.getClientRects().length).length);
const bad = (page, sel) => page.$eval(sel, (el) => /NaN|undefined|Infinity/.test(el.innerText)).catch(() => false);

// ---------- desktop ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: SCHEME });
  const page = await ctx.newPage();
  const errors = []; watch(page, errors);
  await page.goto(`${BASE}/#simulator`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // clean default: no interpretations / what-ifs / notes visible; key tiles present
  const clean = await words(page);
  if (await visible(page, '#tab-simulator .rcard .short') > 0) fail('clean view: result interpretations are visible');
  if (await visible(page, '#tab-simulator .help-slot') > 0) fail('clean view: help-slot text is visible');
  if (await visible(page, '.kpi') !== 6) fail('expected 6 key-result tiles');
  if (await bad(page, '#tab-simulator')) fail('NaN/undefined visible in clean view');

  // every explanatory text is still in the DOM (nothing lost)
  const inDom = await page.evaluate(() => ({
    shorts: [...document.querySelectorAll('#tab-simulator .rcard .short')].filter((e) => e.textContent.trim()).length,
    eqs: document.querySelectorAll('#tab-simulator .rcard .detail .eq .katex').length,
    interps: document.querySelectorAll('#tab-simulator .rcard .more .interp').length,
    slots: [...document.querySelectorAll('#tab-simulator .help-slot')].filter((e) => e.textContent.trim()).length,
    cards: document.querySelectorAll('#tab-simulator .rcard').length,
  }));
  if (inDom.cards !== 35) fail(`expected 35 result rows, found ${inDom.cards}`);
  if (inDom.shorts < 30) fail(`interpretations missing from DOM (${inDom.shorts})`);
  if (inDom.eqs < 35) fail(`equations missing from DOM (${inDom.eqs})`);
  if (inDom.slots < 12) fail(`help slots (chart what-ifs, notes) missing (${inDom.slots})`);

  // KPI tiles agree with their result rows
  for (const [kpi, card] of [['kwh', 'kwh'], ['yield', 'yield'], ['imp', 'imp'], ['BPE', 'BPE']]) {
    const k = await page.$eval(`#kpi-${kpi} .kpi-num`, (e) => parseFloat(e.textContent.replace(/,/g, '')));
    const c = await page.$eval(`#card-${card} .num`, (e) => parseFloat(e.textContent.replace(/,/g, '')));
    if (!(Math.abs(k - c) <= Math.max(0.051, Math.abs(c) * 0.002))) fail(`KPI ${kpi} (${k}) disagrees with card ${card} (${c})`);
  }

  // Help panel from a result row: opens with KaTeX and live numbers, no NaN; updates with a slider; Esc closes, focus returns
  await page.click('#card-C .help');
  await page.waitForTimeout(350);
  const hp = await page.$eval('#help-panel', (el) => ({ shown: !el.hidden, katex: el.querySelectorAll('.katex').length, title: el.querySelector('#help-title').textContent, val: el.querySelector('.hp-value')?.textContent }));
  if (!hp.shown) fail('help panel did not open');
  if (hp.katex < 2) fail(`help panel: expected equation + substitution (${hp.katex} KaTeX)`);
  if (await bad(page, '#help-panel')) fail('help panel shows NaN/undefined');
  await page.screenshot({ path: join(OUT, `desktop-help-${SCHEME}.png`) });
  await page.$eval('#in-F', (el) => { el.value = '20000'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(400);
  const val2 = await page.$eval('#help-panel .hp-value', (e) => e.textContent);
  if (val2 === hp.val) fail('help panel did not update with a slider change');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  if (!(await page.$eval('#help-panel', (el) => el.hidden))) fail('Esc did not close the help panel');
  const focus = await page.evaluate(() => document.activeElement?.closest('.rcard')?.id);
  if (focus !== 'card-C') fail(`focus did not return to the trigger (${focus})`);

  // Help from a chart and an input group
  for (const sel of ['[data-help-chart]', '[data-help-group]', '[data-help-pfd]']) {
    const n = await page.$$(sel);
    if (!n.length) { fail(`no ${sel} buttons`); continue; }
    await n[0].click();
    await page.waitForTimeout(250);
    const ok = await page.$eval('#help-panel', (el) => !el.hidden && el.querySelector('#help-body').innerText.trim().length > 10);
    if (!ok) fail(`${sel}: help panel empty or closed`);
    await page.click('#help-panel .hp-close');
    await page.waitForTimeout(150);
  }

  // Explain switch: shows everything inline; persists across reload; switching back restores the clean view
  await page.click('#explain-toggle');
  await page.waitForTimeout(400);
  const exp = await words(page);
  if (await visible(page, '#tab-simulator .rcard .short') < 30) fail('Explain: interpretations not shown');
  if (await visible(page, '#tab-simulator .rcard .detail .eq .katex') < 35) fail('Explain: equations not shown');
  if (!(exp > clean * 1.5)) fail(`Explain should reveal much more text (clean ${clean}, explain ${exp})`);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  if ((await page.getAttribute('#explain-toggle', 'aria-pressed')) !== 'true') fail('Explain choice not remembered');
  await page.click('#explain-toggle');
  await page.waitForTimeout(300);

  // charts: 4 groups, all 12 rendered (No Plot = No Pay)
  const ch = await page.evaluate(() => ({ groups: document.querySelectorAll('.chart-sec').length, plots: [...document.querySelectorAll('#tab-simulator .js-plotly-plot')].filter((p) => p.querySelector('.main-svg')).length }));
  if (ch.groups !== 4) fail(`expected 4 chart groups, found ${ch.groups}`);
  if (ch.plots !== 12) fail(`expected 12 rendered charts, found ${ch.plots}`);
  if (errors.length) fail(`desktop console errors: ${errors.slice(0, 3).join(' | ')}`);
  await page.screenshot({ path: join(OUT, `desktop-clean-${SCHEME}.png`) });
  writeFileSync(join(OUT, `words-${SCHEME}.txt`), `clean ${clean}\nexplain ${exp}\n`);
  await ctx.close();
}

// ---------- phone ----------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, colorScheme: SCHEME });
  const page = await ctx.newPage();
  const errors = []; watch(page, errors);
  await page.goto(`${BASE}/#simulator`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // results come first: key tiles are near the top, inputs live in a sheet
  const kpiTop = await page.$eval('#kpis', (el) => el.getBoundingClientRect().top + scrollY);
  if (kpiTop > 700) fail(`phone: key results start too low (${Math.round(kpiTop)} px)`);
  const btn = await page.$('#inputs-toggle');
  if (!btn) fail('phone: Inputs button missing');
  else {
    await btn.tap();
    await page.waitForTimeout(400);
    const open = await page.evaluate(() => document.body.classList.contains('sheet-open'));
    if (!open) fail('phone: Inputs sheet did not open');
    const before = await page.$eval('#kpi-yield .kpi-num', (e) => e.textContent);
    await page.$eval('#in-purgeRatio', (el) => { el.value = '0.15'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(400);
    const after = await page.$eval('#kpi-yield .kpi-num', (e) => e.textContent);
    if (before === after) fail('phone: slider in the Inputs sheet did not update the key results');
    await page.screenshot({ path: join(OUT, `phone-inputs-${SCHEME}.png`) });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    if (await page.evaluate(() => document.body.classList.contains('sheet-open'))) fail('phone: Esc did not close the Inputs sheet');
  }
  await page.$eval('#kpi-yield .kpi-help', (b) => b.click());
  await page.waitForTimeout(350);
  const sheet = await page.$eval('#help-panel', (el) => { const r = el.getBoundingClientRect(); return { shown: !el.hidden, bottom: Math.round(r.bottom), w: Math.round(r.width) }; });
  if (!sheet.shown || sheet.bottom < 800 || sheet.w < 370) fail(`phone: help should be a bottom sheet (${JSON.stringify(sheet)})`);
  await page.screenshot({ path: join(OUT, `phone-help-${SCHEME}.png`) });
  for (const t of ['simulator', 'overview', 'theory', 'references']) {
    await page.evaluate((x) => { location.hash = `#${x}`; }, t);
    await page.waitForTimeout(250);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (sw > 1) fail(`phone #${t}: horizontal scroll ${sw}px`);
  }
  if (errors.length) fail(`phone console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

await browser.close();
const report = failures.length ? failures.map((f) => `- ❌ ${f}`).join('\n') : `- ✅ all Liquid Glass checks passed (${SCHEME})`;
writeFileSync(join(OUT, `report-${SCHEME}.md`), `# Liquid Glass simulator checks (${SCHEME})\n\n${report}\n`);
console.log(report);
process.exit(failures.length ? 1 : 0);
