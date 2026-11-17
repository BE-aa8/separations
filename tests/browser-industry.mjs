// Industry Context tab: background-video band (YouTube stubbed, because the real player cannot run in CI),
// dialog, product arithmetic, no red flags, layout. Presentation only.
// Usage: node tests/browser-industry.mjs --base http://localhost:8000 --out <dir> [--scheme dark]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') && a.push([x.slice(2), arr[i + 1]]), a), []));
const BASE = (args.base || 'http://localhost:8000').replace(/\/$/, '');
const OUT = args.out || 'docs/screenshots/verification/industry';
const SCHEME = args.scheme === 'dark' ? 'dark' : 'light';
mkdirSync(OUT, { recursive: true });
const failures = [];
const fail = (m) => failures.push(m);
const browser = await chromium.launch();

// A fake YouTube IFrame API: records play/pause calls; reports PLAYING only if window.__stubPlay is true.
const STUB_API = `(() => {
  window.__stubCalls = [];
  window.YT = { PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2 }, Player: class {
    constructor(el, o) {
      this.o = o; const f = document.createElement('iframe'); f.src = 'about:blank'; f.dataset.stub = '1';
      el.replaceWith(f); this.f = f;
      setTimeout(() => { o.events.onReady({ target: this }); if (window.__stubPlay) o.events.onStateChange({ data: 1 }); }, 50);
    }
    playVideo() { window.__stubCalls.push('play'); } pauseVideo() { window.__stubCalls.push('pause'); }
    mute() {} getIframe() { return this.f; } getDuration() { return 100; } getCurrentTime() { return 0; } seekTo() {}
    destroy() { this.f.remove(); }
  } };
  if (window.onYouTubeIframeAPIReady) window.onYouTubeIframeAPIReady();
})();`;
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkqK//DwAEgQJ/lYq3pQAAAABJRU5ErkJggg==', 'base64');

async function setup({ play = true, block = false, ...ctxOpts }) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: SCHEME, ...ctxOpts });
  await ctx.addInitScript((p) => { window.__stubPlay = p; }, play);
  const yt = [];
  await ctx.route(/(youtube\.com|youtube-nocookie\.com|ytimg\.com|googlevideo\.com)/, (route) => {
    const u = route.request().url();
    yt.push(u);
    if (block) return route.abort();
    if (/iframe_api/.test(u)) return route.fulfill({ status: 200, contentType: 'text/javascript', body: STUB_API });
    if (/ytimg/.test(u)) return route.fulfill({ status: 200, contentType: 'image/png', body: PNG });
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>stub</title>' });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !(block && /Failed to load resource/.test(m.text()))) errors.push(m.text()); });
  return { ctx, page, yt, errors };
}
const st = (page) => page.evaluate(() => ({ ...window.__indVideo, ds: document.getElementById('ind-video').dataset.video, iframes: document.querySelectorAll('#ind-video-media iframe').length, calls: (window.__stubCalls || []).slice() }));

// ---------- A. desktop, autoplay works ----------
{
  const { ctx, page, yt, errors } = await setup({ play: true });
  await page.goto(`${BASE}/#overview`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  if (yt.length) fail(`YouTube contacted before the Industry tab was opened (${yt[0]})`);
  await page.evaluate(() => { location.hash = '#industry'; });
  await page.waitForTimeout(1200);
  const a = await st(page);
  if (!a.apiRequested || a.iframes !== 1) fail(`background player not created (${JSON.stringify(a)})`);
  if (a.ds !== 'playing') fail(`background should be 'playing' once the API reports PLAYING (got ${a.ds})`);
  const ifr = await page.$eval('#ind-video-media iframe', (f) => ({ pe: getComputedStyle(f).pointerEvents, tab: f.getAttribute('tabindex'), hidden: f.getAttribute('aria-hidden'), w: f.getBoundingClientRect().width, bw: document.getElementById('ind-video').getBoundingClientRect().width })).catch(() => null);
  if (!ifr || ifr.pe !== 'none' || ifr.tab !== '-1' || ifr.hidden !== 'true') fail(`background iframe should be inert (${JSON.stringify(ifr)})`);
  if (ifr && ifr.w < ifr.bw) fail(`background video should cover the band (${Math.round(ifr.w)} < ${Math.round(ifr.bw)})`);
  if (!a.calls.includes('play')) fail('background video was never told to play');
  // content
  const c = await page.evaluate(async () => {
    const { simulate, DEFAULT_INPUTS } = await import('/js/model.js');
    const C = simulate({ ...DEFAULT_INPUTS }).mass.C;
    return {
      flags: document.querySelectorAll('#tab-industry .flag').length,
      rate: document.getElementById('ind-rate').textContent, n: document.getElementById('ind-eq-n').textContent,
      expectN: (2500 / C).toFixed(1), katex: document.querySelectorAll('#tab-industry .katex').length,
      plot: !!document.querySelector('#p-ind .main-svg'), refining: /dominate lithium refining/i.test(document.getElementById('tab-industry').innerText),
      cites: [...document.querySelectorAll('#tab-industry .cite')].filter((e) => !e.textContent.trim()).length,
    };
  });
  if (c.flags) fail(`${c.flags} red flag(s) still on the Industry tab`);
  if (c.rate !== '2,500') fail(`crystal rate should be 20,000 t/yr / 8,000 h/yr = 2,500 kg/h (got ${c.rate})`);
  if (!c.n.includes(c.expectN)) fail(`N should be 2,500 / C = ${c.expectN} (got "${c.n}")`);
  if (c.katex < 2) fail('Industry equations did not render');
  if (!c.plot) fail('Industry chart did not render');
  if (c.refining) fail('refining-dominance paragraph should be removed');
  if (c.cites) fail(`${c.cites} empty citation(s)`);
  await page.screenshot({ path: join(OUT, `industry-${SCHEME}.png`) });
  // leaving the tab pauses; coming back plays
  await page.evaluate(() => { window.__stubCalls.length = 0; location.hash = '#theory'; });
  await page.waitForTimeout(300);
  let calls = (await st(page)).calls;
  if (calls[calls.length - 1] !== 'pause') fail(`video should pause on another tab (calls ${calls.join(',')})`);
  await page.evaluate(() => { window.__stubCalls.length = 0; location.hash = '#industry'; });
  await page.waitForTimeout(400);
  calls = (await st(page)).calls;
  if (calls[calls.length - 1] !== 'play') fail(`video should resume on returning (calls ${calls.join(',')})`);
  // scrolled out of view pauses
  await page.evaluate(() => { window.__stubCalls.length = 0; window.scrollTo(0, document.body.scrollHeight); });
  await page.waitForTimeout(500);
  calls = (await st(page)).calls;
  if (calls[calls.length - 1] !== 'pause') fail(`video should pause when scrolled away (calls ${calls.join(',')})`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  // dialog with sound
  await page.click('#ind-watch');
  await page.waitForTimeout(300);
  const d = await page.evaluate(() => ({ open: document.getElementById('ind-dialog').open, src: document.querySelector('#ind-dialog-frame iframe')?.src || '', focus: document.activeElement?.id, last: (window.__stubCalls || []).slice(-1)[0] }));
  if (!d.open) fail('Watch with sound did not open the dialog');
  if (!/youtube-nocookie\.com\/embed\/rxYTx6aj96k/.test(d.src) || /mute=1/.test(d.src) || /controls=0/.test(d.src)) fail(`dialog player should be the normal player with sound (${d.src})`);
  if (d.focus !== 'ind-dialog-close') fail(`focus should move into the dialog (${d.focus})`);
  if (d.last !== 'pause') fail('background should pause while the dialog is open');
  await page.screenshot({ path: join(OUT, `industry-dialog-${SCHEME}.png`) });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const d2 = await page.evaluate(() => ({ open: document.getElementById('ind-dialog').open, frames: document.querySelectorAll('#ind-dialog-frame iframe').length, focus: document.activeElement?.id }));
  if (d2.open || d2.frames) fail(`Esc should close the dialog and remove its player (${JSON.stringify(d2)})`);
  if (d2.focus !== 'ind-watch') fail(`focus should return to the Watch button (${d2.focus})`);
  // jump button scrolls to the steps without switching tabs
  await page.click('#ind-jump');
  await page.waitForTimeout(900);
  const j = await page.evaluate(() => ({ hash: location.hash, top: Math.round(document.getElementById('ind-steps').getBoundingClientRect().top) }));
  if (j.hash !== '#industry' || j.top > 400) fail(`jump should scroll to the steps on the same tab (${JSON.stringify(j)})`);
  if (errors.length) fail(`console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------- B. autoplay blocked: the poster stays, the player is removed ----------
{
  const { ctx, page, errors } = await setup({ play: false });
  await page.goto(`${BASE}/#industry`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  if ((await st(page)).ds === 'playing') fail('should not show the player before PLAYING');
  await page.waitForTimeout(8200);
  const b = await st(page);
  if (b.ds !== 'poster' || b.iframes) fail(`blocked autoplay should fall back to the poster (${JSON.stringify(b)})`);
  if (errors.length) fail(`blocked autoplay: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------- C. YouTube unreachable (ad blocker / offline) ----------
{
  const { ctx, page, errors } = await setup({ block: true });
  await page.goto(`${BASE}/#industry`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const c = await st(page);
  if (c.ds !== 'poster') fail(`YouTube blocked: should show the poster (${c.ds})`);
  if (errors.length) fail(`YouTube blocked: page errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------- D. reduced motion and phone: no background video; Watch still works ----------
for (const [name, opts] of [['reduced-motion', { reducedMotion: 'reduce' }], ['phone', { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }]]) {
  const { ctx, page, yt, errors } = await setup({ play: true, ...opts });
  await page.goto(`${BASE}/#industry`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const s = await st(page);
  if (s.apiRequested || s.iframes || yt.some((u) => /iframe_api|embed/.test(u))) fail(`${name}: background video should not load`);
  await page.click('#ind-watch');
  await page.waitForTimeout(300);
  if (!(await page.evaluate(() => document.getElementById('ind-dialog').open && !!document.querySelector('#ind-dialog-frame iframe')))) fail(`${name}: Watch with sound did not open the player`);
  await page.click('#ind-dialog-close');
  await page.waitForTimeout(200);
  if (await page.evaluate(() => document.getElementById('ind-dialog').open)) fail(`${name}: close button did not close the dialog`);
  const sw = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth - document.documentElement.clientWidth, iw: innerWidth }));
  if (sw.sw > 1) fail(`${name}: horizontal scroll ${sw.sw}px`);
  // a too-wide element makes a phone zoom out (layout viewport wider than the device), which scrollWidth alone misses
  if (name === 'phone' && sw.iw > 376) fail(`phone: layout widened to ${sw.iw}px (something is wider than the screen)`);
  if (name === 'phone') await page.screenshot({ path: join(OUT, `industry-phone-${SCHEME}.png`), fullPage: true });
  if (errors.length) fail(`${name}: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

await browser.close();
const report = failures.length ? failures.map((f) => `- ❌ ${f}`).join('\n') : `- ✅ all Industry tab checks passed (${SCHEME})`;
writeFileSync(join(OUT, `report-${SCHEME}.md`), `# Industry tab checks (${SCHEME})\n\n${report}\n`);
console.log(report);
process.exit(failures.length ? 1 : 0);
