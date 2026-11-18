// hero.js: "CRYSTALLIZE" dot-lattice hero (looks only; no physics of the project's model).
// The letters are a lattice of dots. On load the dots settle out of a scattered cloud onto
// their lattice sites (a nod to crystallization). Moving the pointer stirs a small 2-D fluid
// (Stam "stable fluids": splat -> vorticity confinement -> advection -> pressure projection),
// and the dots are carried by its swirls while springs pull them back to their sites.
// Plain Canvas 2D, no libraries. Pauses when hidden or off screen; respects reduced motion.

const host = document.getElementById('hero');
const canvas = document.getElementById('hero-canvas');
if (host && canvas && canvas.getContext) start();

function start() {
  const ctx = canvas.getContext('2d', { alpha: false });
  // motion setting: <html data-motion> (device Reduce Motion by default, or the header toggle)
  const isReduce = () => document.documentElement.dataset.motion === 'off';
  const COLORS = { bg: '#090D0C', dot: '#F0F1EB', fast: '#A6BB43' };

  // ---- state ----
  let W = 0, H = 0, dpr = 1, gap = 6, dot = 2.5;
  let N = 0, hx, hy, px, py, vx, vy;            // particles: home, position, velocity
  let cs = 16, nx = 0, ny = 0;                  // fluid grid
  let u, v, u0, v0, p, dv, curl;
  let introT = 0, built = false, running = false, visible = false, raf = 0;
  const pointer = { x: 0, y: 0, dx: 0, dy: 0, has: false, last: 0 };
  let idle = null;                              // automatic stir when untouched
  const stats = { frames: 0, particles: 0 };
  window.__heroStats = stats;                   // read-only counters for the browser test

  // ---- layout and text mask ----
  function linesFor(w) { return w < 700 ? ['CRYS', 'TAL', 'LIZE'] : ['CRYSTALLIZE']; }
  function copyBottom() {
    const c = host.querySelector('.hero-copy');
    if (!c) return 0;
    const hr = host.getBoundingClientRect(), r = c.getBoundingClientRect();
    return Math.max(0, r.bottom - hr.top);
  }

  function build() {
    const r = host.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    if (w < 10 || h < 10) return false;
    W = w; H = h;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

    // fit the word in the space below the copy
    const lines = linesFor(W);
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const o = off.getContext('2d');
    const family = '"Inter", system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
    let fs = 100;
    o.font = `800 ${fs}px ${family}`;
    const widest = Math.max(...lines.map((t) => o.measureText(t).width)) || 1;
    const margin = Math.max(16, W * 0.03);
    const lineH = 0.96;
    const top = copyBottom() + 18, bottom = H - Math.max(28, H * 0.07);
    const byWidth = fs * (W - 2 * margin) / widest;
    const byHeight = (bottom - top) / (lines.length * lineH);
    fs = Math.max(24, Math.min(byWidth, byHeight));
    o.font = `800 ${fs}px ${family}`;
    o.fillStyle = '#fff';
    o.textBaseline = 'alphabetic';
    const blockH = lines.length * fs * lineH;
    // center the word block in the free space below the copy
    let y = top + Math.max(0, (bottom - top - blockH) / 2) + fs * 0.8;
    for (const t of lines) { o.fillText(t, margin - fs * 0.04, y); y += fs * lineH; }

    gap = Math.max(3.5, Math.min(7, fs / 30));
    dot = Math.max(1.5, gap * 0.5);
    const img = o.getImageData(0, 0, W, H).data;
    const homesX = [], homesY = [];
    for (let yy = gap / 2; yy < H; yy += gap) {
      for (let xx = gap / 2; xx < W; xx += gap) {
        const i = ((yy | 0) * W + (xx | 0)) * 4;
        if (img[i + 3] > 128) { homesX.push(xx); homesY.push(yy); }
      }
    }
    N = homesX.length;
    hx = Float32Array.from(homesX); hy = Float32Array.from(homesY);
    px = new Float32Array(N); py = new Float32Array(N); vx = new Float32Array(N); vy = new Float32Array(N);
    for (let k = 0; k < N; k++) {
      if (isReduce()) { px[k] = hx[k]; py[k] = hy[k]; continue; }
      // "supersaturated cloud": scattered start, settles onto the lattice
      const a = Math.random() * Math.PI * 2, rr = (0.15 + Math.random() * 0.6) * Math.max(W, H);
      px[k] = hx[k] + Math.cos(a) * rr * 0.35;
      py[k] = hy[k] + Math.sin(a) * rr * 0.25;
      vx[k] = (Math.random() - 0.5) * 2; vy[k] = (Math.random() - 0.5) * 2;
    }
    stats.particles = N;

    // fluid grid
    cs = W < 700 ? 14 : 16;
    nx = Math.ceil(W / cs) + 2; ny = Math.ceil(H / cs) + 2;
    const n = nx * ny;
    u = new Float32Array(n); v = new Float32Array(n); u0 = new Float32Array(n); v0 = new Float32Array(n);
    p = new Float32Array(n); dv = new Float32Array(n); curl = new Float32Array(n);
    introT = isReduce() ? 1 : 0;
    built = true;
    return true;
  }

  // ---- fluid solver (grid units: velocity in px/frame) ----
  const IX = (i, j) => i + j * nx;
  function splat(x, y, fx, fy, radius) {
    const ci = x / cs + 1, cj = y / cs + 1, R = radius / cs, R2 = R * R;
    const i0 = Math.max(1, Math.floor(ci - 2 * R)), i1 = Math.min(nx - 2, Math.ceil(ci + 2 * R));
    const j0 = Math.max(1, Math.floor(cj - 2 * R)), j1 = Math.min(ny - 2, Math.ceil(cj + 2 * R));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const d2 = (i - ci) ** 2 + (j - cj) ** 2;
      const w = Math.exp(-d2 / R2);
      u[IX(i, j)] += fx * w; v[IX(i, j)] += fy * w;
    }
  }
  function vorticity(eps) {
    for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
      curl[IX(i, j)] = 0.5 * ((v[IX(i + 1, j)] - v[IX(i - 1, j)]) - (u[IX(i, j + 1)] - u[IX(i, j - 1)]));
    }
    for (let j = 2; j < ny - 2; j++) for (let i = 2; i < nx - 2; i++) {
      const gx = 0.5 * (Math.abs(curl[IX(i + 1, j)]) - Math.abs(curl[IX(i - 1, j)]));
      const gy = 0.5 * (Math.abs(curl[IX(i, j + 1)]) - Math.abs(curl[IX(i, j - 1)]));
      const len = Math.hypot(gx, gy) + 1e-5;
      const w = curl[IX(i, j)];
      u[IX(i, j)] += eps * (gy / len) * w;
      v[IX(i, j)] -= eps * (gx / len) * w;
    }
  }
  function sample(f, x, y) {               // bilinear, x/y in cell coordinates
    x = Math.max(0.5, Math.min(nx - 1.5, x)); y = Math.max(0.5, Math.min(ny - 1.5, y));
    const i = x | 0, j = y | 0, s = x - i, t = y - j;
    return (1 - t) * ((1 - s) * f[IX(i, j)] + s * f[IX(i + 1, j)]) + t * ((1 - s) * f[IX(i, j + 1)] + s * f[IX(i + 1, j + 1)]);
  }
  function advect() {
    u0.set(u); v0.set(v);
    for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
      const k = IX(i, j);
      const x = i - u0[k] / cs, y = j - v0[k] / cs;
      u[k] = sample(u0, x, y); v[k] = sample(v0, x, y);
    }
  }
  function project(iters) {
    for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
      dv[IX(i, j)] = -0.5 * (u[IX(i + 1, j)] - u[IX(i - 1, j)] + v[IX(i, j + 1)] - v[IX(i, j - 1)]);
    }
    p.fill(0);
    for (let it = 0; it < iters; it++) {
      for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
        p[IX(i, j)] = (dv[IX(i, j)] + p[IX(i - 1, j)] + p[IX(i + 1, j)] + p[IX(i, j - 1)] + p[IX(i, j + 1)]) * 0.25;
      }
    }
    for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
      u[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]);
      v[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]);
    }
  }
  function boundaries(decay) {
    for (let k = 0; k < u.length; k++) { u[k] *= decay; v[k] *= decay; }
    for (let i = 0; i < nx; i++) { u[IX(i, 0)] = v[IX(i, 0)] = u[IX(i, ny - 1)] = v[IX(i, ny - 1)] = 0; }
    for (let j = 0; j < ny; j++) { u[IX(0, j)] = v[IX(0, j)] = u[IX(nx - 1, j)] = v[IX(nx - 1, j)] = 0; }
  }

  // ---- forcing: pointer and idle stir ----
  function force(now) {
    const R = Math.max(40, Math.min(W, H) * 0.09);
    if (pointer.has && (pointer.dx || pointer.dy)) {
      const m = Math.min(45, Math.hypot(pointer.dx, pointer.dy));
      const sc = m > 0 ? m / Math.hypot(pointer.dx, pointer.dy) : 0;
      splat(pointer.x, pointer.y, pointer.dx * sc * 0.45, pointer.dy * sc * 0.45, R);
      pointer.dx = pointer.dy = 0;
      pointer.last = now;
    }
    if (now - pointer.last > 4000 && introT >= 1) {
      if (!idle) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        idle = { t0: now, dur: 2600, dir, y0: H * (0.55 + Math.random() * 0.25), amp: H * 0.12, x: dir > 0 ? -R : W + R };
      }
      const s = (now - idle.t0) / idle.dur;
      if (s >= 1) { idle = null; pointer.last = now; return; }
      const xNew = idle.dir > 0 ? -R + s * (W + 2 * R) : W + R - s * (W + 2 * R);
      const yNew = idle.y0 + Math.sin(s * Math.PI * 3) * idle.amp;
      const ddx = xNew - idle.x, ddy = (yNew - (idle.yPrev ?? yNew));
      splat(xNew, yNew, ddx * 0.35, ddy * 0.6, R * 0.9);
      idle.x = xNew; idle.yPrev = yNew;
    } else idle = null;
  }

  // ---- particles and drawing ----
  function stepParticles() {
    introT = Math.min(1, introT + 1 / 90);
    const ks = 0.006 + 0.016 * introT * introT;   // springs strengthen as the "crystal" forms
    const kf = 0.24, damp = 0.86;
    for (let k = 0; k < N; k++) {
      const fu = sample(u, px[k] / cs + 1, py[k] / cs + 1);
      const fv = sample(v, px[k] / cs + 1, py[k] / cs + 1);
      vx[k] = vx[k] * damp + (hx[k] - px[k]) * ks + fu * kf;
      vy[k] = vy[k] * damp + (hy[k] - py[k]) * ks + fv * kf;
      px[k] += vx[k]; py[k] += vy[k];
    }
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, W, H);
    const h = dot / 2;
    ctx.fillStyle = COLORS.dot;
    for (let k = 0; k < N; k++) {
      if (vx[k] * vx[k] + vy[k] * vy[k] > 9) continue;
      ctx.fillRect(px[k] - h, py[k] - h, dot, dot);
    }
    ctx.fillStyle = COLORS.fast;
    for (let k = 0; k < N; k++) {
      if (vx[k] * vx[k] + vy[k] * vy[k] <= 9) continue;
      ctx.fillRect(px[k] - h, py[k] - h, dot, dot);
    }
  }

  function frame(now) {
    raf = 0;
    if (!running) return;
    if (host.offsetParent === null) { running = false; visible = false; return; }   // tab switched away
    try {
      force(now);
      vorticity(0.32);
      advect();
      project(14);
      boundaries(0.985);
      stepParticles();
      draw();
      stats.frames++;
    } catch { running = false; return; }   // fail quietly: this is decoration
    raf = requestAnimationFrame(frame);
  }

  function update() {
    if (host.offsetParent === null) visible = false;         // its tab is hidden
    const shouldRun = visible && !document.hidden && !isReduce();
    if (!built || canvas.width !== Math.round(host.getBoundingClientRect().width * Math.min(2, window.devicePixelRatio || 1))) {
      if (!build()) return;
      if (isReduce()) draw();
    }
    if (shouldRun && !running) { running = true; pointer.last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); }
    if (!shouldRun) running = false;
    if (isReduce() && built) draw();
  }

  // ---- events ----
  host.addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (pointer.has) { pointer.dx += x - pointer.x; pointer.dy += y - pointer.y; }
    pointer.x = x; pointer.y = y; pointer.has = true;
  }, { passive: true });
  host.addEventListener('pointerleave', () => { pointer.has = false; pointer.dx = pointer.dy = 0; }, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      for (const en of entries) visible = en.isIntersecting;
      update();
    }, { threshold: 0.01 }).observe(host);
  } else { visible = true; }
  document.addEventListener('visibilitychange', update);
  document.addEventListener('motionchange', () => { if (!isReduce()) introT = 1; update(); });
  window.addEventListener('hashchange', () => setTimeout(update, 0));
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { built = false; update(); }, 150); });

  const fontsReady = document.fonts && document.fonts.load ? document.fonts.load('800 100px "Inter"').catch(() => null) : Promise.resolve();
  fontsReady.then(() => { built = false; update(); });
}
