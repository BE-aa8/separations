// UX checks: light/dark theme toggle and the live PFD animation (presentation only).
// Usage: node tests/browser-ux.mjs --base http://localhost:8000 --out <dir>
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') && a.push([x.slice(2), arr[i + 1]]), a), []));
const BASE = (args.base || 'http://localhost:8000').replace(/\/$/, '');
const OUT = args.out || 'docs/screenshots/verification/ux';
mkdirSync(OUT, { recursive: true });
const failures = [];
const fail = (m) => failures.push(m);
const browser = await chromium.launch();

const watch = (page, errors) => {
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
};
// flows are driven by js/flow-anim.js (requestAnimationFrame): sample stroke-dashoffset twice
const moving = (page, sel) => page.evaluate(async (q) => {
  const els = [...document.querySelectorAll(q)];
  const a = els.map((e) => e.style.strokeDashoffset);
  await new Promise((r) => setTimeout(r, 450));
  return { n: els.length, moved: els.filter((e, i) => e.style.strokeDashoffset !== a[i]).length };
}, sel);
const paperBg = (page) => page.$eval('#p5 .main-svg', (svg) => getComputedStyle(svg).backgroundColor || svg.style.background).catch(() => null);

// ---------- 1. theme: default follows the device, toggle flips and persists ----------
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = []; watch(page, errors);
  await page.goto(`${BASE}/#simulator`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const t0 = await page.evaluate(() => document.documentElement.dataset.theme);
  if (t0 !== scheme) fail(`default theme should follow device (${scheme}), got ${t0}`);
  const bg0 = await paperBg(page);
  await page.click('#theme-toggle');
  await page.waitForTimeout(600);
  const t1 = await page.evaluate(() => document.documentElement.dataset.theme);
  const other = scheme === 'dark' ? 'light' : 'dark';
  if (t1 !== other) fail(`toggle from ${scheme} should give ${other}, got ${t1}`);
  const pressed = await page.getAttribute('#theme-toggle', 'aria-pressed');
  if (pressed !== String(t1 === 'dark')) fail(`aria-pressed=${pressed} does not match theme ${t1}`);
  const bg1 = await paperBg(page);
  if (!bg0 || bg0 === bg1) fail(`chart background did not change with theme (${bg0} -> ${bg1})`);
  await page.screenshot({ path: join(OUT, `sim-${other}.png`) });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const t2 = await page.evaluate(() => document.documentElement.dataset.theme);
  if (t2 !== other) fail(`theme choice not remembered after reload (expected ${other}, got ${t2})`);
  if (errors.length) fail(`theme (${scheme}): console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------- 2. live PFD ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = []; watch(page, errors);
  await page.goto(`${BASE}/#simulator`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.getElementById('sec-pfd').scrollIntoView({ block: 'center' }));
  const mv = await moving(page, '#pfd svg .flow');
  const info = await page.evaluate(() => {
    const svg = document.querySelector('#pfd svg');
    return { vapor: +svg.dataset.flowVapor, purge: +svg.dataset.flowPurge, legend: !!document.querySelector('.pfd-legend'), imp: document.querySelector('#pfd .impeller .spin').getAttribute('transform') };
  });
  info.n = mv.n; info.running = mv.moved;
  await page.waitForTimeout(150);
  if (info.imp === await page.$eval('#pfd .impeller .spin', (e) => e.getAttribute('transform'))) fail('impeller is not spinning');
  if (info.n < 7) fail(`expected >= 7 animated streams, found ${info.n}`);
  if (info.running < info.n) fail(`only ${info.running}/${info.n} streams animating`);
  if (!(info.vapor < info.purge)) fail(`vapor (${info.vapor}s) should flow faster than purge (${info.purge}s)`);
  if (!info.legend) fail('stream legend missing');
  // the feed slider changes the flow speeds
  const before = await page.$eval('#pfd svg', (s) => s.style.getPropertyValue('--d-feed'));
  await page.$eval('#in-F', (el) => { el.value = String(+el.max); el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(300);
  const after = await page.$eval('#pfd svg', (s) => s.style.getPropertyValue('--d-feed'));
  if (!before || before === after) fail(`feed slider did not change flow speed (${before} -> ${after})`);
  await page.screenshot({ path: join(OUT, 'pfd-live.png'), clip: { x: 330, y: 150, width: 950, height: 420 } });
  // infeasible preset stops the flows
  await page.click('[data-preset="infeasible"]');
  await page.waitForTimeout(400);
  const stopped = await page.$eval('#pfd svg', (s) => s.classList.contains('stopped'));
  if (!stopped) fail('infeasible preset should stop the flows');
  await page.click('[data-preset="handcalc"]');
  await page.waitForTimeout(400);
  if (await page.$eval('#pfd svg', (s) => s.classList.contains('stopped'))) fail('flows should restart after a feasible preset');
  // a slider change flashes card values
  await page.$eval('#in-T_C', (el) => { el.value = '70'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(120);
  const flashed = await page.$$eval('.rcard .num.changed', (els) => els.length);
  if (flashed < 3) fail(`expected changed card values to flash, got ${flashed}`);
  if (errors.length) fail(`pfd: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------- 3. reduced motion and mobile, both themes ----------
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce', colorScheme: scheme });
  // the Industry tab's poster comes from YouTube's image host; stub it so the run does not depend on that network
  await ctx.route(/(youtube\.com|youtube-nocookie\.com|ytimg\.com)/, (r) => r.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkqK//DwAEgQJ/lYq3pQAAAABJRU5ErkJggg==', 'base64') }));
  const page = await ctx.newPage();
  const errors = []; watch(page, errors);
  await page.goto(`${BASE}/#simulator`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.evaluate(() => document.getElementById('sec-pfd').scrollIntoView({ block: 'center' }));
  const rm = await moving(page, '#pfd svg .flow');
  const css = await page.evaluate(() => [...document.querySelectorAll('#pfd svg .flow, #pfd svg .spin, #pfd svg .xtal')].filter((e) => e.getAnimations().some((a) => a.playState === 'running')).length);
  if (rm.moved || css) fail(`reduced motion (${scheme}): PFD still moving (${rm.moved} flows, ${css} CSS animations)`);
  for (const tab of ['overview', 'industry', 'theory', 'simulator', 'ai-workflow', 'video', 'references']) {
    await page.evaluate((t) => { location.hash = `#${t}`; }, tab);
    await page.waitForTimeout(250);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (sw > 1) fail(`mobile ${scheme} #${tab}: horizontal scroll ${sw}px`);
    const iw = await page.evaluate(() => innerWidth);
    if (iw > 376) fail(`mobile ${scheme} #${tab}: layout widened to ${iw}px (phone would zoom out)`);
  }
  await page.evaluate(() => { location.hash = '#simulator'; });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, `mobile-${scheme}.png`) });
  if (errors.length) fail(`mobile ${scheme}: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------- 4. Overview intro, standalone branding ----------
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = []; watch(page, errors);
  await page.goto(`${BASE}/#overview`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const ov = await page.evaluate(() => {
    const intro = document.querySelector('.ov-intro'), hero = document.getElementById('hero');
    const flows = [...document.querySelectorAll('.ov-diagram .ov-f')];
    return {
      intro: !!intro, title: document.querySelector('.ov-title')?.textContent || '',
      heroBelow: !!(intro && hero && (intro.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_FOLLOWING)),
      flows: flows.length,
      gone: !/What the simulator shows/i.test(document.getElementById('tab-overview').innerText),
      learned: /What I learned/i.test(document.getElementById('tab-video').textContent),
      header: Math.round(document.querySelector('.site-header').getBoundingClientRect().height),
    };
  });
  if (!ov.intro || !/compressor/i.test(ov.title)) fail(`overview (${scheme}): intro/headline missing`);
  if (!ov.heroBelow) fail(`overview (${scheme}): dot hero should sit below the intro`);
  const om = await moving(page, '.ov-diagram .ov-f');
  if (ov.flows < 7 || om.moved < om.n) fail(`overview (${scheme}): diagram flows ${om.moved}/${om.n} moving`);
  if (!ov.gone) fail('overview: "What the simulator shows" should be removed');
  if (!ov.learned) fail('"What I learned" should be on the Video & Transcript tab');
  if (ov.header > 70) fail(`desktop header should be one row (${ov.header} px)`);
  await page.click('.ov-cta');
  await page.waitForTimeout(400);
  if (!(await page.isVisible('#tab-simulator'))) fail('overview CTA did not open the Simulator');
  await page.goto(`${BASE}/#overview`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(OUT, `overview-${scheme}.png`) });
  for (const path of ['/', '/gemini/']) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    const hit = await page.evaluate(() => (document.documentElement.outerHTML.match(/Cincinnati|CHE\s*4061|Prof\.?\s*(Carlos\s*)?Co\b|Carlos Co/i) || [])[0]);
    if (hit) fail(`${path}: course/university reference found ("${hit}")`);
  }
  if (errors.length) fail(`overview (${scheme}): console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}
for (const vp of [{ width: 375, height: 812 }, { width: 820, height: 1180 }]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/#overview`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('.ov-diagram').scrollIntoView({ block: 'center' }));
  const o = await moving(page, '.ov-diagram .ov-f');
  if (o.moved < o.n) fail(`mobile ${vp.width}px: overview flows ${o.moved}/${o.n} moving`);
  await page.evaluate(() => { location.hash = '#simulator'; });
  await page.waitForTimeout(700);
  await page.evaluate(() => document.getElementById('sec-pfd').scrollIntoView({ block: 'center' }));
  const p = await moving(page, '#pfd svg .flow');
  if (p.moved < p.n) fail(`mobile ${vp.width}px: PFD flows ${p.moved}/${p.n} moving`);
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/#overview`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const r = await moving(page, '.ov-diagram .ov-f');
  if (r.moved) fail(`overview reduced motion: ${r.moved} diagram flows still moving`);
  await ctx.close();
}

await browser.close();
const report = failures.length ? failures.map((f) => `- ❌ ${f}`).join('\n') : '- ✅ all UX checks passed (theme toggle, live PFD, reduced motion, mobile, overview intro)';
writeFileSync(join(OUT, 'report.md'), `# UX browser checks\n\n${report}\n`);
console.log(report);
process.exit(failures.length ? 1 : 0);
