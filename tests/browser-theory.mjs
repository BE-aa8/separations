// Theory tab: clean default view (concept cards with key equations, folded text), nothing lost from the
// page, live numbers equal the model, dropdowns and controls work, layout. Presentation only.
// Usage: node tests/browser-theory.mjs --base http://localhost:8000 --out <dir> [--scheme dark]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') && a.push([x.slice(2), arr[i + 1]]), a), []));
const BASE = (args.base || 'http://localhost:8000').replace(/\/$/, '');
const OUT = args.out || 'docs/screenshots/verification/theory';
const SCHEME = args.scheme === 'dark' ? 'dark' : 'light';
mkdirSync(OUT, { recursive: true });
const failures = [];
const fail = (m) => failures.push(m);
// opening words of every paragraph, list item and definition of the pre-cleanup Theory tab
const ORIGINAL = ["LiOH is non-volatile, so the vapor", "An ideal (colligative) estimate uses i", "In a single effect, 1 kg", "The compressor only has to raise", "The solubility curve c*(T) is the", "Seeding: adding seed crystals and operating", "Nucleation vs growth: nucleation creates new", "Too small: slow centrifuging and filtering,", "Sodium (as NaOH) does not crystallize", "LiOH solubility is nearly flat with", "Impurities do not change LiOH solubility.", "Steam vapor is an ideal gas", "Multi-effect economy uses the ideal EN", "Boiling-point elevation: how much hotter a", "Temperature rise the compressor must provide:", "kg water evaporated per kg of", "Mechanical vapor recompression: an electrically driven", "Coefficient of performance: heat delivered per", "The saturated solution the crystals grow", "Purge flow / feed flow, P/F.", "Adhering liquor: kg of mother liquor", "Lithium carbonate equivalent, the industry's unit", "Ratio of the real to the"];
const BEFORE_WORDS = 2092;   // visible words before the cleanup (1280 px)

const browser = await chromium.launch();
const stub = (ctx) => ctx.route(/(youtube\.com|youtube-nocookie\.com|ytimg\.com)/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '' }));
const watch = (page, errors) => {
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
};

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: SCHEME });
  await stub(ctx);
  const page = await ctx.newPage();
  const errors = []; watch(page, errors);
  await page.goto(`${BASE}/#theory`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const v = await page.evaluate(async () => {
    const tab = document.getElementById('tab-theory');
    const visible = (e) => e.getClientRects().length > 0;
    const { simulate, DEFAULT_INPUTS } = await import('./js/model.js');
    const hc = simulate({ ...DEFAULT_INPUTS });
    const norm = (t) => t.replace(/\s+/g, ' ');
    return {
      words: tab.innerText.trim().split(/\s+/).length,
      cards: tab.querySelectorAll('.th-card').length,
      cardEqs: [...tab.querySelectorAll('.th-card .th-eq .katex')].filter(visible).length,
      openMore: [...tab.querySelectorAll('.th-more')].filter((d) => d.open).length,
      openGroups: [...tab.querySelectorAll('#theory-equations details')].filter((d) => d.open).length,
      groups: tab.querySelectorAll('#theory-equations details').length,
      eqCards: tab.querySelectorAll('#theory-equations .eq-card').length,
      eqKatex: tab.querySelectorAll('#theory-equations .eq-card .katex').length,
      text: norm(tab.textContent),
      live: [...tab.querySelectorAll('[data-live]')].map((e) => e.textContent),
      lift: tab.querySelector('[data-live="lift"]').textContent, cop: tab.querySelector('[data-live="cop"]').textContent,
      expLift: hc.mvr.lift.toFixed(1), expCop: Math.round(hc.mvr.COP).toString(),
      flags: tab.querySelectorAll('.flag').length,
      bad: /NaN|undefined/.test(tab.innerText),
    };
  });
  if (v.cards !== 7) fail(`expected 7 concept cards, found ${v.cards}`);
  if (v.cardEqs < 7) fail(`each concept card should show its key equation (${v.cardEqs} visible)`);
  if (v.openMore || v.openGroups) fail(`dropdowns should start closed (${v.openMore} read-more, ${v.openGroups} groups open)`);
  if (v.groups !== 5 || v.eqCards !== 33 || v.eqKatex < 33) fail(`equation reference incomplete (${v.groups} groups, ${v.eqCards} cards, ${v.eqKatex} KaTeX)`);
  if (!(v.words < BEFORE_WORDS * 0.4)) fail(`clean view should show far fewer words (${v.words} vs ${BEFORE_WORDS} before)`);
  const missing = ORIGINAL.filter((f) => !v.text.includes(f));
  if (missing.length) fail(`original text missing from the page: ${missing.slice(0, 3).join(' | ')}`);
  if (v.live.some((t) => !t || t === '—')) fail(`a live number is empty (${v.live.join(', ')})`);
  if (v.lift !== v.expLift || v.cop !== v.expCop) fail(`at-a-glance lift/COP (${v.lift}, ${v.cop}) should equal the model (${v.expLift}, ${v.expCop})`);
  if (v.flags) fail(`${v.flags} red flag(s) left on the Theory tab`);
  if (v.bad) fail('NaN/undefined visible on the Theory tab');
  await page.screenshot({ path: join(OUT, `theory-${SCHEME}.png`) });

  // Read more opens and closes
  await page.click('.th-card:nth-child(5) .th-more summary');
  await page.waitForTimeout(200);
  const opened = await page.evaluate(() => { const d = document.querySelector('.th-card:nth-child(5) .th-more'); return d.open && d.querySelector('.th-body').getClientRects().length > 0; });
  if (!opened) fail('Read more did not open');
  await page.click('.th-card:nth-child(5) .th-more summary');
  await page.waitForTimeout(150);
  if (await page.evaluate(() => document.querySelector('.th-card:nth-child(5) .th-more').open)) fail('Read more did not close');

  // Expand all / Collapse all
  await page.click('#th-expand');
  await page.waitForTimeout(250);
  const ex = await page.evaluate(() => ({ open: [...document.querySelectorAll('#theory-equations details')].filter((d) => d.open).length, vis: [...document.querySelectorAll('#theory-equations .eq-card .katex')].filter((e) => e.getClientRects().length).length, label: document.getElementById('th-expand').textContent }));
  if (ex.open !== 5 || ex.vis < 33 || ex.label !== 'Collapse all') fail(`Expand all should open 5 groups with 33 equations (${JSON.stringify(ex)})`);
  await page.click('#th-expand');
  await page.waitForTimeout(200);
  if (await page.evaluate(() => [...document.querySelectorAll('#theory-equations details')].some((d) => d.open))) fail('Collapse all left a group open');

  // jump button scrolls on the same tab
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('#th-jump');
  await page.waitForTimeout(900);
  const j = await page.evaluate(() => ({ hash: location.hash, top: Math.round(document.getElementById('th-equations').getBoundingClientRect().top) }));
  if (j.hash !== '#theory' || j.top > 300) fail(`Jump should scroll to the equations on the same tab (${JSON.stringify(j)})`);
  if (errors.length) fail(`console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// phone: one column, no horizontal scroll or zoom-out, dropdowns work
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, colorScheme: SCHEME });
  await stub(ctx);
  const page = await ctx.newPage();
  const errors = []; watch(page, errors);
  await page.goto(`${BASE}/#theory`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.tap('#th-expand');
  await page.waitForTimeout(300);
  const m = await page.evaluate(() => ({ iw: innerWidth, sw: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
  if (m.iw > 376 || m.sw > 1) fail(`phone: layout too wide (innerWidth ${m.iw}, horizontal scroll ${m.sw}px)`);
  const hdr = await page.evaluate(() => { const t = document.getElementById('theme-toggle').getBoundingClientRect(), mo = document.getElementById('motion-toggle').getBoundingClientRect(); return Math.abs(t.top - mo.top) < 2; });
  if (!hdr) fail('phone: header buttons wrapped onto two rows');
  await page.screenshot({ path: join(OUT, `theory-phone-${SCHEME}.png`), fullPage: true });
  if (errors.length) fail(`phone console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

await browser.close();
const report = failures.length ? failures.map((f) => `- ❌ ${f}`).join('\n') : `- ✅ all Theory tab checks passed (${SCHEME})`;
writeFileSync(join(OUT, `report-${SCHEME}.md`), `# Theory tab checks (${SCHEME})\n\n${report}\n`);
console.log(report);
process.exit(failures.length ? 1 : 0);
