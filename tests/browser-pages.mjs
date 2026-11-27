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
  // presentation slides under the video: navigation, keyboard, downloads
  await page.waitForFunction(() => { const im = document.getElementById('deck-img'); return im && im.complete && im.naturalWidth > 0; }, null, { timeout: 15000 }).catch(() => {});
  const dk = await page.evaluate(async () => {
    const im = document.getElementById('deck-img');
    const head = async (u) => (await fetch(u, { method: 'HEAD' })).status;
    return { n: (window.__deck || {}).count, w: im.naturalWidth, alt: im.alt, count: document.getElementById('deck-count').textContent,
      prevDisabled: document.getElementById('deck-prev').disabled, pdf: await head('slides/mvr-presentation.pdf'), pptx: await head('slides/mvr-presentation.pptx'),
      below: document.getElementById('vd-card').compareDocumentPosition(document.getElementById('deck')) & Node.DOCUMENT_POSITION_FOLLOWING };
  });
  if (dk.n !== 21 || dk.w !== 1600 || !/Slide 1 of 21/.test(dk.alt) || dk.count !== '1 / 21' || !dk.prevDisabled) fail(`slide viewer did not start on slide 1 (${JSON.stringify(dk)})`);
  if (dk.pdf !== 200 || dk.pptx !== 200) fail(`slide downloads missing (pdf ${dk.pdf}, pptx ${dk.pptx})`);
  if (!dk.below) fail('slides should sit under the video card');
  await page.click('#deck-next');
  await page.click('#deck-next');
  await page.waitForTimeout(300);
  let st = await page.evaluate(() => ({ c: document.getElementById('deck-count').textContent, src: document.getElementById('deck-img').getAttribute('src') }));
  if (st.c !== '3 / 21' || !/s-03\.jpg$/.test(st.src)) fail(`next button did not advance (${JSON.stringify(st)})`);
  await page.focus('#deck-viewer');
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(300);
  st = await page.evaluate(() => ({ c: document.getElementById('deck-count').textContent, ok: document.getElementById('deck-img').complete && document.getElementById('deck-img').naturalWidth > 0 }));
  if (st.c !== '20 / 21' || !st.ok) fail(`keyboard navigation failed (${JSON.stringify(st)})`);
  // thumbnails, title line, full screen
  const th = await page.evaluate(() => ({ n: document.querySelectorAll('#deck-thumbs .deck-thumb').length, on: [...document.querySelectorAll('#deck-thumbs .deck-thumb')].findIndex((b) => b.classList.contains('is-on')), title: document.getElementById('deck-title').textContent }));
  if (th.n !== 21 || th.on !== 19 || !/^Title: Conclusions$/.test(th.title)) fail(`thumbnails/title out of sync (${JSON.stringify(th)})`);
  await page.click('#deck-thumbs .deck-thumb:nth-child(5)');
  await page.waitForTimeout(300);
  st = await page.evaluate(() => ({ c: document.getElementById('deck-count').textContent, t: document.getElementById('deck-title').textContent, thumbOk: [...document.querySelectorAll('#deck-thumbs img')].slice(0, 5).every((im) => im.complete && im.naturalWidth === 320) }));
  if (st.c !== '5 / 21' || !/Three models/.test(st.t) || !st.thumbOk) fail(`thumbnail click failed (${JSON.stringify(st)})`);
  await page.evaluate(() => document.getElementById('deck').scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: join(OUT, `slides-${SCHEME}.png`) });
  await page.click('#deck-fs');
  await page.waitForTimeout(500);
  const fs = await page.evaluate(() => { const r = document.getElementById('deck-img').getBoundingClientRect(); return { on: window.__deck.fullscreen(), label: document.getElementById('deck-fs').textContent, w: Math.round(r.width), vw: innerWidth }; });
  if (!fs.on || fs.label !== 'Exit full screen' || fs.w < fs.vw * 0.6) fail(`full screen did not open (${JSON.stringify(fs)})`);
  await page.screenshot({ path: join(OUT, `slides-fullscreen-${SCHEME}.png`) });
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(200);
  if (await page.evaluate(() => document.getElementById('deck-count').textContent) !== '6 / 21') fail('arrow keys should work in full screen');
  await page.click('#deck-fs');
  await page.waitForTimeout(400);
  if (await page.evaluate(() => window.__deck.fullscreen())) fail('Exit full screen did not close it');

  // the recorded presentation is embedded and the verbatim transcript is filled in
  const tr = await page.evaluate(() => {
    const lines = [...document.querySelectorAll('#vd-transcript p a.tr-t')];
    const body = document.getElementById('vd-transcript').textContent;
    return { src: document.querySelector('#vd-card iframe')?.src || '', n: lines.length, first: lines[0]?.textContent, last: lines.at(-1)?.textContent,
      firstText: lines[0]?.parentElement.textContent, lastText: lines.at(-1)?.parentElement.textContent,
      ordered: lines.every((a, k) => k === 0 || +a.dataset.t > +lines[k - 1].dataset.t), placeholder: /after upload|will be pasted|coming by/i.test(document.getElementById('tab-video').textContent),
      dupLabel: /\d+ (minutes?|seconds?)\b/.test([...document.querySelectorAll('#vd-transcript a.tr-t')].map((a) => a.textContent).join(' ')), len: body.length };
  });
  if (!/youtube-nocookie\.com\/embed\/BLQXmZmRMlQ/.test(tr.src)) fail(`presentation video not embedded (${tr.src})`);
  if (tr.n < 200 || tr.first !== '0:01' || tr.last !== '27:31' || !tr.ordered) fail(`transcript incomplete (${JSON.stringify({ n: tr.n, first: tr.first, last: tr.last, ordered: tr.ordered })})`);
  if (!/hey everyone/.test(tr.firstText) || !/thanks for watching/.test(tr.lastText)) fail('transcript first/last lines do not match the YouTube transcript');
  if (tr.placeholder) fail('Video tab still shows a placeholder');
  await page.click('#tab-video details.th-acc summary');
  await page.waitForTimeout(150);
  await page.click('#vd-transcript a.tr-t[data-t="1152"]');
  await page.waitForTimeout(200);
  const seek = await page.evaluate(() => document.querySelector('#vd-card iframe').src);
  if (!/start=1152/.test(seek)) fail(`transcript time did not seek the player (${seek})`);
  await page.screenshot({ path: join(OUT, `video-${SCHEME}.png`) });

  // ---------- References ----------
  await page.evaluate(() => { location.hash = '#references'; });
  await page.waitForTimeout(400);
  const rf = await page.evaluate(async () => {
    const { DATA } = await import('./js/data.js');
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
  if (rf.nValRows < 30 || rf.nValShown !== rf.nValRows) fail(`values: table ${rf.nValRows}, shown ${rf.nValShown}`);
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

// ---------- video hook rejects a malformed ID ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await stub(ctx);
  const page = await ctx.newPage();
  // a bad ID is ignored (the card keeps its fallback link), set inside the browser so it also works against the live site
  await page.addInitScript(() => {
    new MutationObserver((_, obs) => { const c = document.getElementById('vd-card'); if (c) { c.dataset.videoId = 'bad id"><x'; obs.disconnect(); } })
      .observe(document, { childList: true, subtree: true });
  });
  await page.goto(`${BASE}/#video`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const bad = await page.evaluate(() => ({ iframe: !!document.querySelector('#vd-card iframe'), link: !!document.querySelector('#vd-card .vd-s a') }));
  if (bad.iframe || !bad.link) fail(`invalid video ID should leave the fallback card (${JSON.stringify(bad)})`);
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
