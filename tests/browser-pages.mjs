// AI Workflow, Video & Transcript and References tabs: clean intros, nothing lost, controls work, counts
// equal the data, phone layout. Presentation only.
// Usage: node tests/browser-pages.mjs --base http://localhost:8000 --out <dir> [--scheme dark]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') && a.push([x.slice(2), arr[i + 1]]), a), []));
const BASE = (args.base || 'http://localhost:8000').replace(/\/$/, '');
const OUT = args.out || 'docs/screenshots/verification/pages';
const SCHEME = args.scheme === 'dark' ? 'dark' : 'light';
mkdirSync(OUT, { recursive: true });
const failures = [];
const fail = (m) => failures.push(m);
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

  // ---------- AI Workflow ----------
  await page.goto(`${BASE}/#ai-workflow`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const aw = await page.evaluate(() => {
    const t = document.getElementById('tab-ai-workflow');
    const tables = [...t.querySelectorAll('table.data-table')];
    return {
      title: t.querySelector('.ov-title')?.textContent || '',
      glance: t.querySelectorAll('.th-glance dl > div').length,
      steps: t.querySelectorAll('.aw-steps li').length,
      finds: t.querySelectorAll('.aw-find').length,
      imgs: [...t.querySelectorAll('.compare-shots img')].filter((i) => i.complete && i.naturalWidth > 0).length,
      rows: tables.map((tb) => tb.querySelectorAll('tbody tr').length),
      closed: [...t.querySelectorAll('details.th-acc')].every((d) => !d.open),
      red: t.querySelectorAll('.flag, .placeholder').length,
      logHidden: t.querySelector('.subpanel[data-sub="log"]').hidden,
      milestones: t.querySelectorAll('.aw-timeline li').length,
      falseClaim: t.textContent.includes('approved by course instructor'),
    };
  });
  if (!/one critic/i.test(aw.title) || aw.glance !== 5) fail(`AI Workflow intro incomplete (${JSON.stringify(aw)})`);
  if (aw.steps !== 4 || aw.finds !== 5) fail(`AI Workflow: expected 4 workflow steps and 5 findings (${aw.steps}, ${aw.finds})`);
  if (aw.imgs !== 2) fail(`AI Workflow: both comparison screenshots should load (${aw.imgs})`);
  if (aw.rows.join(',') !== '12,10') fail(`AI Workflow: results table should keep 12 rows and the critique table 10 (${aw.rows})`);
  if (!aw.closed) fail('AI Workflow: detail dropdowns should start closed');
  if (aw.red) fail(`AI Workflow: ${aw.red} red flag/placeholder left`);
  if (!aw.falseClaim) fail('AI Workflow: the documented Gemini false claim must stay visible as evidence');
  if (!aw.logHidden || aw.milestones < 10) fail(`Process Log should be a hidden subpanel with the milestone timeline (${aw.milestones})`);
  await page.click('.subtab[data-sub="log"]');
  await page.waitForTimeout(200);
  const sw = await page.evaluate(() => ({ log: !document.querySelector('.subpanel[data-sub="log"]').hidden, cmp: document.querySelector('.subpanel[data-sub="comparison"]').hidden, vis: [...document.querySelectorAll('.aw-timeline li')].filter((l) => l.getClientRects().length).length }));
  if (!sw.log || !sw.cmp || sw.vis < 10) fail(`Process Log subtab did not switch (${JSON.stringify(sw)})`);
  await page.screenshot({ path: join(OUT, `ai-log-${SCHEME}.png`) });
  await page.click('.subtab[data-sub="comparison"]');
  await page.waitForTimeout(150);
  await page.click('#tab-ai-workflow details.th-acc summary');
  await page.waitForTimeout(150);
  if (!(await page.evaluate(() => document.querySelector('#tab-ai-workflow details.th-acc').open))) fail('AI Workflow: results dropdown did not open');
  await page.screenshot({ path: join(OUT, `ai-workflow-${SCHEME}.png`) });

  // ---------- Video ----------
  await page.evaluate(() => { location.hash = '#video'; });
  await page.waitForTimeout(400);
  const vd = await page.evaluate(() => {
    const t = document.getElementById('tab-video');
    return { title: t.querySelector('.ov-title')?.textContent, card: !!t.querySelector('#vd-card'), learned: /What I learned/.test(t.textContent), transcript: /verbatim YouTube auto-transcript/i.test(t.textContent), red: t.querySelectorAll('.flag, .placeholder').length };
  });
  if (vd.title !== 'The presentation' || !vd.card || !vd.learned || !vd.transcript) fail(`Video tab incomplete (${JSON.stringify(vd)})`);
  if (vd.red) fail(`Video tab: ${vd.red} red flag/placeholder left`);
  // the one-line video hook renders the player
  await page.evaluate(() => { const c = document.getElementById('vd-card'); c.dataset.videoId = 'abcdefghijk'; });
  await page.screenshot({ path: join(OUT, `video-${SCHEME}.png`) });

  // ---------- References ----------
  await page.evaluate(() => { location.hash = '#references'; });
  await page.waitForTimeout(400);
  const rf = await page.evaluate(async () => {
    const { DATA } = await import('/js/data.js');
    const t = document.getElementById('tab-references');
    return {
      title: t.querySelector('.ov-title')?.textContent,
      nSrcData: Object.keys(DATA.sources).length,
      nSrcList: t.querySelectorAll('#source-list li').length,
      nSrcShown: +document.getElementById('ref-n-src').textContent,
      nValRows: t.querySelectorAll('#value-table tbody tr').length,
      nValShown: +document.getElementById('ref-n-val').textContent,
      nEstRows: [...t.querySelectorAll('#value-table tbody tr')].filter((r) => [...r.querySelectorAll('.est-chip')].some((c) => c.textContent === 'estimate')).length,
      nEstShown: +document.getElementById('ref-n-est').textContent,
      people: [...t.querySelectorAll('.ref-people h4')].map((h) => h.textContent),
      red: t.querySelectorAll('.flag, .placeholder').length,
      student: /\(student\)/i.test(t.textContent),
      cites: [...document.querySelectorAll('.cite')].filter((c) => !/\[\d+\]/.test(c.textContent)).length,
    };
  });
  if (rf.title !== 'Every number has a source') fail('References intro missing');
  if (rf.nSrcList !== rf.nSrcData || rf.nSrcShown !== rf.nSrcData) fail(`sources: list ${rf.nSrcList}, shown ${rf.nSrcShown}, data ${rf.nSrcData}`);
  if (rf.nValRows < 40 || rf.nValShown !== rf.nValRows) fail(`values: table ${rf.nValRows}, shown ${rf.nValShown}`);
  if (rf.nEstShown !== rf.nEstRows) fail(`estimates: shown ${rf.nEstShown}, table ${rf.nEstRows}`);
  for (const who of ['Andrew', 'Claude', 'Gemini', 'ChatGPT', 'Other tools']) if (!rf.people.some((p) => p.includes(who))) fail(`contributions: ${who} missing`);
  if (rf.red) fail(`References: ${rf.red} red flag/placeholder left`);
  if (rf.student) fail('References: "(student)" label should be gone');
  if (rf.cites) fail(`${rf.cites} citation link(s) without a number`);
  await page.click('#tab-references details.th-acc summary');
  await page.waitForTimeout(150);
  if (!(await page.evaluate(() => document.querySelector('#value-table').getClientRects().length > 0))) fail('References: value table dropdown did not open');
  await page.screenshot({ path: join(OUT, `references-${SCHEME}.png`) });
  if (errors.length) fail(`console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------- video hook renders a player when an ID is set before init ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await stub(ctx);
  const page = await ctx.newPage();
  // set the video ID as the page is parsed (inside the browser, so it also works against the live site)
  await page.addInitScript(() => {
    new MutationObserver((_, obs) => { const c = document.getElementById('vd-card'); if (c) { c.dataset.videoId = 'abcdefghijk'; obs.disconnect(); } })
      .observe(document, { childList: true, subtree: true });
  });
  await page.goto(`${BASE}/#video`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const src = await page.evaluate(() => document.querySelector('#vd-card iframe')?.src || '');
  if (!/youtube-nocookie\.com\/embed\/abcdefghijk/.test(src)) fail(`video hook did not render the player (${src})`);
  await ctx.close();
}

// ---------- phone ----------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, colorScheme: SCHEME });
  await stub(ctx);
  const page = await ctx.newPage();
  const errors = []; watch(page, errors);
  for (const t of ['ai-workflow', 'video', 'references']) {
    await page.goto(`${BASE}/#${t}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true; }));
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => ({ iw: innerWidth, sw: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    if (m.iw > 376 || m.sw > 1) fail(`phone #${t}: layout too wide (innerWidth ${m.iw}, scroll ${m.sw}px)`);
  }
  if (errors.length) fail(`phone console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

await browser.close();
const report = failures.length ? failures.map((f) => `- ❌ ${f}`).join('\n') : `- ✅ all AI Workflow / Video / References checks passed (${SCHEME})`;
writeFileSync(join(OUT, `report-${SCHEME}.md`), `# AI Workflow, Video and References checks (${SCHEME})\n\n${report}\n`);
console.log(report);
process.exit(failures.length ? 1 : 0);
