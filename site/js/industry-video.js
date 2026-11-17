// industry-video.js: Tesla's refinery video for the Industry Context tab (presentation only).
//  - Background band: a muted, chrome-less YouTube player behind the headline (the "full-width background
//    video" effect). It is hardened against the usual problems:
//      * nothing from YouTube loads until the Industry tab is opened (lazy, youtube-nocookie host);
//      * the player stays invisible over a poster until the IFrame API reports PLAYING, so a blocked
//        autoplay (iOS Low Power, Data Saver, browser policy) never shows a big play button;
//      * no background video under reduced motion, below 700 px, or with Save-Data;
//      * it pauses on other tabs, when scrolled out of view, when the page is hidden or the dialog is open;
//      * manual loop (seek to 0 just before the end) instead of loop=1, so the end screen never shows;
//      * any failure (API blocked, error, no PLAYING within 8 s) leaves the poster; no console errors.
//  - "Watch with sound": a <dialog> with the normal player (controls + audio). Closing it removes the
//    iframe so audio stops, and focus returns to the button.
const VIDEO_ID = 'rxYTx6aj96k';
const NOCOOKIE = 'https://www.youtube-nocookie.com';
const band = document.getElementById('ind-video');
const media = document.getElementById('ind-video-media');
const dialog = document.getElementById('ind-dialog');
const frame = document.getElementById('ind-dialog-frame');
const watchBtn = document.getElementById('ind-watch');
const closeBtn = document.getElementById('ind-dialog-close');
const jumpBtn = document.getElementById('ind-jump');

const stats = { state: 'poster', apiRequested: false, plays: 0, pauses: 0 };
window.__indVideo = stats;                       // read-only counters for the browser test

let player = null;
let started = false;
let inView = false;
let failTimer = 0;
let loopTimer = 0;
let lastFocus = null;

const mq = (q) => (window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener() {} });
const reduce = mq('(prefers-reduced-motion: reduce)');
const narrow = mq('(max-width: 699px)');
const saveData = () => !!(navigator.connection && navigator.connection.saveData);
const bgAllowed = () => !reduce.matches && !narrow.matches && !saveData();
const tabVisible = () => !!band && band.offsetParent !== null;
const dialogOpen = () => !!dialog && dialog.open;

function setState(s) {
  stats.state = s;
  if (band) band.dataset.video = s;
}

function loadAPI() {
  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) { resolve(window.YT); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (typeof prev === 'function') prev(); resolve(window.YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = () => reject(new Error('YouTube API blocked'));
    stats.apiRequested = true;
    document.head.appendChild(s);
    setTimeout(() => reject(new Error('YouTube API timeout')), 10000);
  });
}

function fail() {
  clearTimeout(failTimer);
  clearInterval(loopTimer);
  if (player) { try { player.destroy(); } catch (e) { /* already gone */ } }
  player = null;
  if (media) media.innerHTML = '';
  setState('poster');
}

function onState(e) {
  const YT = window.YT || {};
  const S = YT.PlayerState || { PLAYING: 1, ENDED: 0, PAUSED: 2 };
  if (e.data === S.PLAYING) {
    clearTimeout(failTimer);
    setState('playing');
    clearInterval(loopTimer);
    loopTimer = setInterval(() => {               // loop before YouTube's end screen can appear
      try {
        const d = player.getDuration(), t = player.getCurrentTime();
        if (d > 3 && t > d - 1.5) player.seekTo(0, true);
      } catch (err) { /* player gone */ }
    }, 400);
  } else if (e.data === S.ENDED) {
    try { player.seekTo(0, true); player.playVideo(); } catch (err) { /* ignore */ }
  } else if (e.data === S.PAUSED) {
    clearInterval(loopTimer);
  }
}

function start() {
  if (started || !band || !media || !bgAllowed()) return;
  started = true;
  setState('loading');
  loadAPI().then((YT) => {
    if (!bgAllowed()) { fail(); return; }
    const holder = document.createElement('div');
    media.appendChild(holder);
    player = new YT.Player(holder, {
      host: NOCOOKIE,
      videoId: VIDEO_ID,
      playerVars: { autoplay: 1, mute: 1, controls: 0, playsinline: 1, rel: 0, iv_load_policy: 3, disablekb: 1, fs: 0, origin: location.origin },
      events: {
        onReady: (ev) => {
          try {
            ev.target.mute();
            const f = ev.target.getIframe();
            f.setAttribute('tabindex', '-1');
            f.setAttribute('aria-hidden', 'true');
            f.title = 'Background video (muted)';
          } catch (err) { /* ignore */ }
          sync();
        },
        onStateChange: onState,
        onError: fail,
      },
    });
    failTimer = setTimeout(() => { if (stats.state !== 'playing') fail(); }, 8000);
  }).catch(fail);
}

// play only when it can be seen; otherwise pause (saves bandwidth, no hidden audio)
function sync() {
  if (tabVisible() && !started && bgAllowed()) start();
  if (!player || typeof player.playVideo !== 'function') return;
  const want = tabVisible() && inView && !document.hidden && !dialogOpen() && bgAllowed();
  try {
    if (want) { player.playVideo(); stats.plays++; }
    else { player.pauseVideo(); stats.pauses++; }
  } catch (e) { /* player not ready yet */ }
}

// ---------- dialog: the normal player with sound ----------
function openDialog() {
  if (!dialog || !frame) return;
  lastFocus = document.activeElement;
  frame.innerHTML = `<iframe src="${NOCOOKIE}/embed/${VIDEO_ID}?autoplay=1&rel=0&playsinline=1" title="Tesla Lithium Refinery (video)" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  sync();
  if (closeBtn) closeBtn.focus();
}
function closeDialog() {
  if (!dialog) return;
  if (dialog.open && typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}
if (dialog) {
  dialog.addEventListener('close', () => {
    if (frame) frame.innerHTML = '';                 // stops the audio
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    sync();
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });   // backdrop click
}
if (watchBtn) watchBtn.addEventListener('click', openDialog);
if (closeBtn) closeBtn.addEventListener('click', closeDialog);
if (jumpBtn) jumpBtn.addEventListener('click', () => {
  const el = document.getElementById('ind-steps');
  if (el) el.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
});

// ---------- visibility wiring ----------
if (band && 'IntersectionObserver' in window) {
  new IntersectionObserver((entries) => {
    for (const en of entries) inView = en.isIntersecting;
    sync();
  }, { threshold: 0.15 }).observe(band);
} else {
  inView = true;
}
window.addEventListener('hashchange', () => {
  if (!tabVisible() && dialogOpen()) closeDialog();
  requestAnimationFrame(sync);                       // after ui.js has shown/hidden the tab
});
document.addEventListener('visibilitychange', sync);
const onPolicy = () => { if (!bgAllowed() && player) { try { player.pauseVideo(); } catch (e) { /* ignore */ } } sync(); };
if (reduce.addEventListener) reduce.addEventListener('change', onPolicy);
if (narrow.addEventListener) narrow.addEventListener('change', onPolicy);
requestAnimationFrame(sync);
