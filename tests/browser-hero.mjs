// Browser checks for the Overview hero (site/js/hero.js): the dot lattice renders, the pointer
// stirs it, reduced motion keeps it static, and it adds no console errors or horizontal scroll.
// Usage: node tests/browser-hero.mjs --base http://localhost:8000 --out <dir>
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') && a.push([x.slice(2), arr[i + 1]]), a), []));
const BASE = (args.base || 'http://localhost:8000').replace(/\/$/, '');
const OUT = args.out || 'docs/screenshots/verification/hero';
mkdirSync(OUT, { recursive: true });
const failures = [];
const fail = (m) => failures.push(m);

// count bright pixels and a coarse signature of the canvas
const probe = () => {
  const c = document.getElementById('hero-canvas');
  if (!c || !c.width) return null;
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let bright = 0; const sig = [];
  const step = 4 * 7;
  for (let i = 0; i < d.length; i += step) { const b = d[i] > 140 ? 1 : 0; bright += b; sig.push(b); }
  return { bright, sig: sig.join('') };
};
const diff = (a, b) => { let n = 0; for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) n++; return n; };

const browser = await chromium.launch();
for (const vp of [{ name: 'desktop', width: 1280, height: 720 }, { name: 'mobile', width: 375, height: 812 }]) {
  for (const motion of ['no-preference', 'reduce']) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: motion, isMobile: vp.width < 500, hasTouch: vp.width < 500 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(`${BASE}/#overview`, { waitUntil: 'networkidle' });
    // the hero sits below the Overview intro and only animates while on screen: bring it into view
    await page.evaluate(() => { const r = document.getElementById('hero').getBoundingClientRect(); window.scrollTo({ top: scrollY + r.top + r.height / 2 - innerHeight / 2, behavior: 'instant' }); });
    await page.waitForTimeout(2200);                    // intro settles
    const a = await page.evaluate(probe);
    const tag = `${vp.name}-${motion}`;
    if (!a) { fail(`${tag}: hero canvas missing or empty`); await ctx.close(); continue; }
    const minBright = vp.name === 'desktop' ? 1200 : 400;   // sampled every 7th pixel
    if (a.bright < minBright) fail(`${tag}: too few lit pixels (${a.bright})`);
    await page.screenshot({ path: join(OUT, `${tag}-rest.png`) });

    if (motion === 'no-preference') {
      // drag across the word (mouse on desktop; synthetic pointer events work for both)
      const box = await page.$eval('#hero', (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
      const y = box.y + box.h * 0.72;
      await page.mouse.move(box.x + box.w * 0.15, y);
      for (let s = 1; s <= 24; s++) await page.mouse.move(box.x + box.w * (0.15 + 0.6 * s / 24), y + Math.sin(s / 3) * 40, { steps: 2 });
      await page.waitForTimeout(250);
      const b = await page.evaluate(probe);
      await page.screenshot({ path: join(OUT, `${tag}-stirred.png`) });
      const changed = diff(a.sig, b.sig);
      if (changed < 200) fail(`${tag}: stirring changed too little (${changed} samples)`);
      const frames = await page.evaluate(() => (window.__heroStats || {}).frames || 0);
      if (frames < 30) fail(`${tag}: animation not running (${frames} frames)`);
    } else {
      await page.waitForTimeout(600);
      const b = await page.evaluate(probe);
      if (diff(a.sig, b.sig) !== 0) fail(`${tag}: reduced motion should be static`);
      const frames = await page.evaluate(() => (window.__heroStats || {}).frames || 0);
      if (frames !== 0) fail(`${tag}: reduced motion should not animate (${frames} frames)`);
    }
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (sw > 1) fail(`${tag}: horizontal scroll (${sw}px)`);
    if (errors.length) fail(`${tag}: console errors: ${errors.slice(0, 3).join(' | ')}`);

    // leaving the tab must pause the loop
    if (motion === 'no-preference') {
      await page.evaluate(() => { location.hash = '#theory'; });
      await page.waitForTimeout(300);
      const f1 = await page.evaluate(() => window.__heroStats.frames);
      await page.waitForTimeout(500);
      const f2 = await page.evaluate(() => window.__heroStats.frames);
      if (f2 - f1 > 2) fail(`${tag}: animation keeps running on another tab (${f2 - f1} frames)`);
    }
    await ctx.close();
  }
}
await browser.close();
const report = failures.length ? failures.map((f) => `- ❌ ${f}`).join('\n') : '- ✅ all hero checks passed';
writeFileSync(join(OUT, 'report.md'), `# Hero browser checks\n\n${report}\n`);
console.log(report);
process.exit(failures.length ? 1 : 0);
