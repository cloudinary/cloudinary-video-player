// S-7 media element and overlay spike. Run from the repository root: node spikes/s7-media/run.mjs
// Bundles fixture/page.js in memory (Rolldown), serves it on a local port, drives headless engines with Playwright,
// prints the facts and writes results.json next to this file.
import { build } from 'rolldown';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from '@playwright/test';

const here = dirname(fileURLToPath(import.meta.url));
const MP4 = 'https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4';
const HLS = 'https://res.cloudinary.com/demo/video/upload/sp_auto/sea_turtle.m3u8';
const versionOf = (pkg) => JSON.parse(readFileSync(join(here, '../../node_modules', pkg, 'package.json'), 'utf8')).version;
const results = {
  versions: { '@videojs/html': versionOf('@videojs/html'), '@videojs/hlsjs-video': versionOf('@videojs/hlsjs-video'), 'hls.js': versionOf('hls.js'), '@playwright/test': versionOf('@playwright/test') },
  engines: {},
};

// ---- build + serve -------------------------------------------------------------------------------------------------
const { output } = await build({ input: join(here, 'fixture/page.js'), platform: 'browser', logLevel: 'warn', write: false, output: { format: 'esm' } });
const files = new Map(output.filter((o) => o.type === 'chunk').map((c) => [`/${c.fileName}`, c.code]));
files.set('/index.html', readFileSync(join(here, 'fixture/index.html'), 'utf8'));
const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://local').pathname;
  const body = files.get(path === '/' ? '/index.html' : path);
  res.writeHead(body ? 200 : 404, { 'content-type': path.endsWith('.js') ? 'text/javascript' : 'text/html' });
  res.end(body ?? '');
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;

// ---- page helpers (run in the browser) -----------------------------------------------------------------------------
const PAGE_HELPERS = () => {
  window.attrs = (el) => Object.fromEntries([...el.attributes].map((a) => [a.name, a.name === 'src' ? a.value.slice(0, 40) : a.value]));
  window.facts = () => {
    const { player, skin, video } = window.ctx;
    const media = player.store.target?.media ?? null;
    const container = skin.shadowRoot.querySelector('media-container');
    const vr = video.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    const videos = window.spike.allVideos();
    return {
      attrs: window.attrs(video),
      storeMedia: media === video ? '<video> (ours)' : media?.localName ?? null,
      storeContainerIsSkinContainer: player.store.target?.container === container,
      sameNodeById: document.getElementById('my-video') === video,
      parent: video.parentElement.localName,
      engineMediaIsOurs: media?.localName === 'hlsjs-video' ? media.engine?.media === video : null,
      wrapperTargetIsOurs: media?.localName === 'hlsjs-video' ? media.target === video : null,
      engineName: media?.engineName ?? 'n/a (plain video)',
      currentSrc: video.currentSrc.slice(0, 60),
      videoRect: [Math.round(vr.width), Math.round(vr.height)],
      containerRect: [Math.round(cr.width), Math.round(cr.height)],
      videosInDocument: videos.length,
      otherVideos: videos.filter((v) => v !== video).map((v) => ({ inShadowOf: v.getRootNode().host?.localName ?? null, src: v.getAttribute('src'), currentSrc: v.currentSrc })),
    };
  };
};

async function waitFor(page, fn, arg, timeout = 20000) {
  try {
    await page.waitForFunction(fn, arg, { timeout });
    return true;
  } catch {
    return false;
  }
}

// Real click on the first visible play button of the skin (center or control bar; hover first to show controls).
async function clickPlay(page) {
  await page.mouse.move(320, 120);
  await page.mouse.move(330, 130);
  await page.waitForTimeout(300);
  for (const button of await page.locator('video-skin media-play-button').all()) {
    if (await button.isVisible()) return button.click({ timeout: 5000 });
  }
  throw new Error('no visible play button');
}

// One engine leg: wait until the player follows, play through the UI, check that time advances, pause.
async function leg(page, name, expectStoreMedia) {
  const attached = await waitFor(page, (want) => {
    const m = window.ctx.player.store.target?.media;
    return want === 'video' ? m === window.ctx.video : m?.localName === want;
  }, expectStoreMedia);
  const ready = await waitFor(page, () => window.ctx.video.readyState >= 2);
  const t0 = await page.evaluate(() => window.ctx.video.currentTime);
  let clicked = true;
  try { await clickPlay(page); } catch { clicked = false; }
  const advanced = await waitFor(page, (t) => !window.ctx.video.paused && window.ctx.video.currentTime > t + 0.5, t0);
  const storeFollows = await page.evaluate(() => window.ctx.player.store.paused === window.ctx.video.paused && Math.abs(window.ctx.player.store.currentTime - window.ctx.video.currentTime) < 1);
  const facts = await page.evaluate(() => window.facts());
  await page.evaluate(() => window.ctx.player.store.pause());
  return { name, attached, ready, clickedPlay: clicked, playbackAdvanced: advanced, storeFollowsVideo: storeFollows, ...facts };
}

// ---- criteria 1 + 2: same <video> across engines ---------------------------------------------------------------------
async function mediaChecks(browser) {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base);
  await page.waitForFunction(() => window.spike);
  await page.evaluate(PAGE_HELPERS);
  const support = await page.evaluate(() => ({
    mp4H264: document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028, mp4a.40.2"'),
    nativeHls: document.createElement('video').canPlayType('application/vnd.apple.mpegurl'),
    mse: typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported('video/mp4; codecs="avc1.640028"'),
    managedMediaSource: typeof ManagedMediaSource !== 'undefined',
  }));
  const before = await page.evaluate(() => window.attrs(document.getElementById('my-video')));
  const legs = [];

  await page.evaluate((src) => { window.ctx = window.spike.mount('my-video'); window.ctx.video.src = src; }, MP4);
  legs.push(await leg(page, '1. native MP4', 'video'));

  await page.evaluate(async (src) => { window.hlsEl = await window.spike.toHls(window.ctx, { src }); }, HLS);
  const hlsLeg = await leg(page, '2. hls.js wrapper', 'hlsjs-video');
  hlsLeg.videoRectWithFillCss = await page.evaluate(async () => {
    document.body.classList.add('fill-fix');
    await window.spike.settle();
    const r = window.ctx.video.getBoundingClientRect();
    return [Math.round(r.width), Math.round(r.height)];
  });
  legs.push(hlsLeg);

  await page.evaluate(async (src) => { await window.spike.toNative(window.ctx, src); }, MP4);
  const back = await leg(page, '3. back to native MP4', 'video');
  back.oldWrapper = await page.evaluate(() => ({ connected: window.hlsEl.isConnected, engine: window.hlsEl.engine === null ? null : 'still set' }));
  legs.push(back);

  // Extra data points: preferPlayback 'native', an MP4 inside the wrapper, and HLS -> MP4 without waiting for detach.
  await page.evaluate(async (src) => { window.hlsEl = await window.spike.toHls(window.ctx, { src, preferPlayback: 'native' }); }, HLS);
  legs.push(await leg(page, 'x1. wrapper, preferPlayback native', 'hlsjs-video'));
  await page.evaluate(async () => { await window.spike.toNative(window.ctx, 'about:blank'); });
  await page.evaluate(async (src) => { window.hlsEl = await window.spike.toHls(window.ctx, { src }); }, MP4);
  legs.push(await leg(page, 'x2. wrapper with an MP4 source', 'hlsjs-video'));
  await page.evaluate(async () => { await window.spike.toNative(window.ctx, 'about:blank'); });
  await page.evaluate(async (src) => { window.hlsEl = await window.spike.toHls(window.ctx, { src }); }, HLS);
  await leg(page, 'x3 setup (hls.js)', 'hlsjs-video');
  await page.evaluate(async (src) => { await window.spike.toNative(window.ctx, src, { waitForDetach: false }); }, MP4);
  legs.push(await leg(page, 'x3. hls.js -> MP4, src set before detach', 'video'));

  await page.close();
  // Attribute diff of our <video> against the integrator's original markup, per leg.
  for (const l of legs) {
    l.attributeDiffVsOriginal = diffAttrs(before, l.attrs);
    delete l.attrs;
  }
  return { support, legs, pageErrors: errors };
}

function diffAttrs(a, b) {
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[k] !== b[k]) out[k] = [a[k] ?? null, b[k] ?? null];
  return out;
}

// ---- criterion 3: overlay layer --------------------------------------------------------------------------------------
async function overlayChecks(browser) {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.goto(base);
  await page.waitForFunction(() => window.spike);
  await page.evaluate(PAGE_HELPERS);
  await page.evaluate((src) => {
    window.ctx = window.spike.mount('my-video');
    window.clicks = { upcoming: 0, end: 0 };
    window.upcoming = window.ctx.layer.addOverlay({ id: 'upcoming', trigger: { beforeEnd: 5 }, placement: 'corner', content: { title: 'Up next: <b>not html</b>', actions: [{ label: 'Play now', onClick: () => window.clicks.upcoming++ }] } });
    window.endScreen = window.ctx.layer.addOverlay({ id: 'endscreen', trigger: 'ended', placement: 'full', content: { title: 'Recommended for you', actions: [{ label: 'Watch again', onClick: () => window.clicks.end++ }] } });
    window.ctx.video.src = src;
  }, MP4);
  await waitFor(page, () => window.ctx.video.readyState >= 1 && window.ctx.player.store.duration > 0);
  await clickPlay(page);
  const out = {};
  const state = () => page.evaluate(() => ({ t: +window.ctx.video.currentTime.toFixed(2), d: +window.ctx.video.duration.toFixed(2), upcoming: window.upcoming.visible, end: window.endScreen.visible }));

  await page.evaluate(() => window.ctx.player.store.seek(window.ctx.video.duration - 8));
  await waitFor(page, () => !window.ctx.video.seeking && !window.ctx.video.paused);
  out.at8sLeft = await state();
  out.upcomingShown = await waitFor(page, () => window.upcoming.visible, null, 15000);
  out.whenUpcomingShown = await state();
  out.upcomingTextIsText = await page.evaluate(() => window.upcoming.el.querySelector('p').textContent === 'Up next: <b>not html</b>' && !window.upcoming.el.querySelector('b'));
  out.hitTestUpcoming = await page.evaluate(() => {
    const r = window.upcoming.el.getBoundingClientRect();
    const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return window.upcoming.el.contains(top);
  });
  out.layer = await page.evaluate(() => {
    const layer = window.ctx.layer;
    const container = window.ctx.skin.shadowRoot.querySelector('media-container');
    const lr = layer.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    return { zIndex: getComputedStyle(layer).zIndex, assignedSlotParent: layer.assignedSlot?.parentElement.localName, coversContainer: Math.round(lr.width) === Math.round(cr.width) && Math.round(lr.height) === Math.round(cr.height) };
  });
  await page.evaluate(() => window.ctx.player.store.seek(window.ctx.video.duration - 20));
  out.hiddenAfterSeekBack = await waitFor(page, () => !window.upcoming.visible, null, 5000);

  await page.evaluate(() => window.ctx.player.store.seek(window.ctx.video.duration - 2));
  out.endScreenShown = await waitFor(page, () => window.ctx.video.ended && window.endScreen.visible, null, 15000);
  out.whenEnded = await state();
  out.hitTest = await page.evaluate(() => {
    const end = window.endScreen.el;
    const r = end.getBoundingClientRect();
    const center = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    const bar = window.ctx.skin.shadowRoot.querySelector('media-controls-content media-play-button').getBoundingClientRect();
    const atBar = window.ctx.skin.shadowRoot.elementFromPoint(bar.x + bar.width / 2, bar.y + bar.height / 2);
    return { centerIsEndScreen: end.contains(center), controlBarAboveOverlay: !!atBar?.closest('media-play-button') };
  });

  // Fullscreen through the skin's own button (real click).
  await page.mouse.move(300, 200);
  try {
    await page.locator('video-skin media-fullscreen-button').click({ timeout: 5000 });
    out.fullscreen = await waitFor(page, () => !!document.fullscreenElement, null, 5000)
      ? await page.evaluate(() => {
        const r = window.endScreen.el.getBoundingClientRect();
        return {
          fullscreenElement: document.fullscreenElement.localName,
          shadowFullscreenElement: window.ctx.skin.shadowRoot.fullscreenElement?.localName ?? null,
          endScreenRect: [Math.round(r.width), Math.round(r.height)],
          viewport: [innerWidth, innerHeight],
          endScreenOnTop: window.endScreen.el.contains(document.elementFromPoint(innerWidth / 2, innerHeight / 2)),
        };
      })
      : 'no fullscreenElement (headless refused)';
    await page.evaluate(() => document.fullscreenElement && document.exitFullscreen());
    await waitFor(page, () => !document.fullscreenElement, null, 5000);
  } catch (e) {
    out.fullscreen = `not verified: ${e.message.split('\n')[0]}`;
  }

  // Clicks: a button in the end screen, then the end screen background (container tap gesture = togglePaused).
  await page.getByRole('button', { name: 'Watch again' }).click();
  await page.waitForTimeout(400);
  out.buttonClick = await page.evaluate(() => ({ handlerRan: window.clicks.end === 1, stillPausedAtEnd: window.ctx.video.paused && window.ctx.video.ended }));
  const box = await page.locator('#endscreen').boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + 20);
  await page.waitForTimeout(600);
  out.backgroundClick = await page.evaluate(() => ({ playbackToggled: !window.ctx.video.paused || !window.ctx.video.ended, endScreenVisible: window.endScreen.visible }));

  // Same click once the end screen stops pointer events from reaching the container's tap gesture.
  await page.evaluate(() => {
    for (const type of ['pointerdown', 'pointerup']) window.endScreen.el.addEventListener(type, (e) => e.stopPropagation());
    window.ctx.player.store.seek(window.ctx.video.duration - 1);
    return window.ctx.player.store.play();
  });
  await waitFor(page, () => window.ctx.video.ended && window.endScreen.visible, null, 15000);
  await page.mouse.click(box.x + box.width / 2, box.y + 20);
  await page.waitForTimeout(600);
  out.backgroundClickWithStopPropagation = await page.evaluate(() => ({ playbackToggled: !window.ctx.video.paused || !window.ctx.video.ended, endScreenVisible: window.endScreen.visible }));
  await page.close();
  return out;
}

// ---- criterion 4: touch scrubbing (Chromium CDP touch events) --------------------------------------------------------
async function touchChecks(browser, throttle) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto(base);
  await page.waitForFunction(() => window.spike);
  await page.evaluate(({ src, throttle }) => {
    window.t = window.spike.mountTouch(src, throttle);
    window.log = [];
    window.phase = 'idle';
    for (const type of ['seeking', 'seeked']) window.t.video.addEventListener(type, () => window.log.push({ type, phase: window.phase, time: +window.t.video.currentTime.toFixed(2) }));
  }, { src: MP4, throttle });
  await waitFor(page, () => window.t.video.readyState >= 1 && window.t.player.store.duration > 0 && window.t.player.store.seekable?.length > 0);
  const requests = [];
  let phase = 'idle';
  page.on('request', (r) => r.url().startsWith('https://res.cloudinary.com/') && requests.push(phase));
  const box = await page.locator('media-time-slider').boundingBox();
  const y = Math.round(box.y + box.height / 2);
  const xAt = (p) => Math.round(box.x + box.width * p);
  const cdp = await context.newCDPSession(page);
  const touch = (type, x) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  const setPhase = (p) => { phase = p; return page.evaluate((p) => { window.phase = p; }, p); };

  await setPhase('drag');
  await touch('touchStart', xAt(0.1));
  const samples = [];
  for (let i = 1; i <= 8; i++) {
    await touch('touchMove', xAt(0.1 + i * 0.1));
    await page.waitForTimeout(150);
    samples.push(await page.evaluate(() => ({ dragging: window.t.slider.hasAttribute('data-dragging'), time: +window.t.video.currentTime.toFixed(1) })));
  }
  await setPhase('release');
  await touch('touchEnd');
  await page.waitForTimeout(1000);
  const log = await page.evaluate(() => window.log);
  await context.close();
  const count = (type, p) => log.filter((e) => e.type === type && e.phase === p).length;
  return {
    changeThrottle: throttle ?? '100 (default)',
    draggingRecognized: samples.some((s) => s.dragging),
    currentTimeDuringDrag: samples.map((s) => s.time),
    seekingDuringDrag: count('seeking', 'drag'),
    seekingAfterRelease: count('seeking', 'release'),
    mediaRequestsDuringDrag: requests.filter((p) => p === 'drag').length,
    mediaRequestsAfterRelease: requests.filter((p) => p === 'release').length,
    finalTime: log.at(-1)?.time ?? null,
  };
}

// ---- run -------------------------------------------------------------------------------------------------------------
async function launchChromium() {
  const bundled = await chromium.launch();
  const page = await bundled.newPage();
  const h264 = await page.evaluate(() => document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"'));
  await page.close();
  if (h264) return { browser: bundled, build: 'Playwright Chromium' };
  await bundled.close();
  return { browser: await chromium.launch({ channel: 'chrome' }), build: 'installed Google Chrome (channel "chrome"): Playwright Chromium has no H.264' };
}

const only = process.argv[2];
const engines = [['chromium', launchChromium], ['webkit', async () => ({ browser: await webkit.launch(), build: 'Playwright WebKit' })], ['firefox', async () => ({ browser: await firefox.launch(), build: 'Playwright Firefox' })]];
try {
  for (const [name, launch] of engines) {
    if (only && only !== name) continue;
    const { browser, build: engineBuild } = await launch();
    const entry = { build: `${engineBuild} ${browser.version()}` };
    try {
      entry.media = await mediaChecks(browser);
      entry.overlay = await overlayChecks(browser);
      if (name === 'chromium') entry.touch = [await touchChecks(browser), await touchChecks(browser, 600000)];
    } catch (e) {
      entry.error = e.message.split('\n')[0]; // first line only: stacks carry local paths
    }
    results.engines[name] = entry;
    await browser.close();
    console.log(JSON.stringify({ [name]: entry }, null, 2));
  }
} finally {
  server.close();
}
if (!only) writeFileSync(join(here, 'results.json'), `${JSON.stringify(results, null, 2)}\n`);
