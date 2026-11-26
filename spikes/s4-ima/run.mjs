// S-4 IMA spike runner. Run from the repository root:
//   node spikes/s4-ima/run.mjs          # v5 checks + v4 checks
//   node spikes/s4-ima/run.mjs v5       # only the Video.js 10 checks
//   node spikes/s4-ima/run.mjs v4       # only the published-v4 checks
//   S4_FILTER=iPhone node spikes/s4-ima/run.mjs v5   # only scenarios whose name contains the text
// Bundles page.js with Rolldown in memory, serves it and v4.html in-process through
// Playwright routing on a fake https origin, drives headless browsers, writes results.json.
// Why https: IMA loads its bridge iframe with the page's protocol; on an http page
// (127.0.0.1 or localhost) the ad request fails with AdError 1005, so no ads play.
import { build } from 'rolldown';
import { chromium, firefox, webkit, devices } from '@playwright/test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const only = process.argv[2] ?? 'all';
const filter = process.env.S4_FILTER; // optional: run only scenarios whose name contains this text
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const videojsVersion = JSON.parse(readFileSync(new URL(import.meta.resolve('@videojs/html/package.json')), 'utf8')).version;

// The v4 demo tag (docs/vast-vpaid.html): Google's public VMAP sample, pre-roll only.
// `postonly` is the same sample with a single post-roll.
const vmap = (ar) =>
  'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250' +
  `&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3D${ar}` +
  `&cmsid=496&vid=short_onecue&correlator=${Date.now()}`;

// ---- page bundle and server ----
const { output } = await build({
  input: join(here, 'page.js'),
  platform: 'browser',
  logLevel: 'warn',
  output: { format: 'esm' },
  write: false,
});
const chunks = new Map(output.filter((o) => o.type === 'chunk').map((c) => [`/${c.fileName}`, c.code]));
const entry = output.find((o) => o.type === 'chunk' && o.isEntry).fileName;
const indexHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>S-4 IMA</title></head><body><script type="module" src="/${entry}"></script></body></html>`;

const base = 'https://s4.spike.test';
const serve = (context) =>
  context.route(`${base}/**`, (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/') return route.fulfill({ contentType: 'text/html', body: indexHtml });
    if (path === '/v4.html') return route.fulfill({ contentType: 'text/html', body: readFileSync(join(here, 'v4.html')) });
    if (chunks.has(path)) return route.fulfill({ contentType: 'text/javascript', body: chunks.get(path) });
    return route.fulfill({ status: 404, body: '' });
  });

// ---- v5 (Video.js 10 + IMA) ----
async function runV5({ name, engine, layout, ios, device }) {
  const browser = await engine.launch();
  const context = await browser.newContext(device ? { ...device } : { viewport: { width: 800, height: 600 } });
  await serve(context);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => ['error', 'warning'].includes(message.type()) && errors.push(`console.${message.type()}: ${message.text().slice(0, 160)}`));
  const query = new URLSearchParams({ layout, tag: vmap('preonly'), ...(ios ? { ios } : {}) });
  let timedOut = false;
  try {
    await page.goto(`${base}/?${query}`);
    await page.waitForFunction(() => window.spike && window.spike.state.phase !== 'loading', null, { timeout: 30000 });
    await page.click('#play');
    await page.waitForFunction(() => window.spike.state.done, null, { timeout: 120000 }).catch(() => (timedOut = true));
    await page.evaluate(() => window.spike.gapTest());
  } catch (error) {
    errors.push(`runner: ${error.message.split('\n')[0]}`);
  }
  const log = await page.evaluate(() => window.spike?.log ?? []).catch(() => []);
  const result = { name, browser: `${browser.browserType().name()} ${browser.version()}`, layout, ios: ios ?? 'default', device: device ? 'iPhone 13 (emulated)' : 'desktop', timedOut, errors, summary: summarizeV5(log), log };
  await browser.close();
  return result;
}

function summarizeV5(log) {
  const snaps = log.filter((e) => e.kind === 'snap');
  const snap = (label) => snaps.find((s) => s.name === label);
  const resumeAt = log.find((e) => e.kind === 'ima' && e.name === 'contentResumeRequested')?.t ?? Infinity;
  const pauseAt = log.find((e) => e.kind === 'ima' && e.name === 'contentPauseRequested')?.t ?? Infinity;
  const duringAd = snaps.filter((s) => s.t >= pauseAt && s.t < resumeAt);
  const uniq = (values) => [...new Set(values)];
  const contentTimes = duringAd.map((s) => s.contentTime);
  const started = log.find((e) => e.kind === 'ima' && e.name === 'start');
  const firstImaVideo = snaps.find((s) => s.imaVideos > 0);
  return {
    imaVersion: log.find((e) => e.name === 'sdk-loaded')?.version,
    adError: log.find((e) => e.name === 'AD_ERROR') ?? null,
    imaVideoFirstSeenAt: firstImaVideo?.name ?? 'never',
    adDuration: started?.adDuration,
    customPlaybackUsed: started?.customPlaybackUsed,
    duringAd: {
      snapshots: duringAd.length,
      storeMedia: uniq(duringAd.map((s) => s.media)),
      discovery: uniq(duringAd.map((s) => s.discovery)),
      imaVideosInContainer: uniq(duringAd.map((s) => s.imaVideos)),
      storePaused: uniq(duringAd.map((s) => s.storePaused)),
      storeDuration: uniq(duringAd.map((s) => s.storeDuration)),
      storeSrc: uniq(duringAd.map((s) => s.storeSrc)),
      contentSrc: uniq(duringAd.map((s) => s.contentSrc)),
      contentTimeRange: contentTimes.length ? [Math.min(...contentTimes), Math.max(...contentTimes)] : null,
    },
    afterResume: pick(snap('content+3s'), ['media', 'storePaused', 'storeTime', 'storeDuration', 'contentPaused', 'contentTime', 'imaVideos']),
    gap: {
      contentRemoved: pick(snap('gap:content-removed'), ['media', 'discovery', 'storeSrc', 'storeDuration']),
      content2Inserted: pick(snap('gap:content-2-inserted'), ['media', 'discovery']),
    },
    eventOrder: log.filter((e) => e.kind !== 'snap').map((e) => `${e.t} ${e.kind}:${e.name}`),
  };
}

const pick = (object, keys) => (object ? Object.fromEntries(keys.map((k) => [k, object[k]])) : null);

// ---- v4 (published 4.1.6 from jsDelivr, as the v4 demo loads it) ----
async function runV4({ name, mode, ains, pto, ar, late, delayPostrollMs }) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
  await serve(context);
  const page = await context.newPage();
  const errors = [];
  const adRequests = [];
  const t0 = Date.now();
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => message.type() === 'error' && errors.push(`console.error: ${message.text().slice(0, 200)}`));
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/gampad/ads')) adRequests.push({ t: Date.now() - t0, vpos: new URL(url).searchParams.get('vpos') ?? 'vmap' });
  });
  if (delayPostrollMs) {
    await page.route(/vpos=postroll/, async (route) => {
      await sleep(delayPostrollMs);
      await route.continue().catch(() => {});
    });
  }
  const query = new URLSearchParams({ mode, tag: vmap(ar), ...(ains ? { ains } : {}), ...(pto ? { pto: String(pto) } : {}), ...(late ? { late: '1' } : {}) });
  try {
    await page.goto(`${base}/v4.html?${query}`);
    await page.waitForSelector('.vjs-big-play-button', { state: 'visible', timeout: 30000 });
    await page.click('.vjs-big-play-button');
    if (mode === 'playlist') {
      await page.waitForFunction(() => {
        const i = v4.log.findIndex((e) => ['adend', 'adtimeout', 'adserror'].includes(e.name));
        return i >= 0 && v4.log.slice(i).some((e) => e.name === 'playing');
      }, null, { timeout: 90000 });
      await sleep(2000);
      await page.evaluate(() => {
        v4.add('probe:playNext()');
        v4.player.playNext();
      });
      await sleep(15000);
    } else {
      // Content after the pre-roll break, or the content end if it played through the wait.
      await page.waitForFunction(() => {
        const i = v4.log.findIndex((e) => ['adend', 'adtimeout', 'adserror'].includes(e.name));
        return (i >= 0 && v4.log.slice(i).some((e) => e.name === 'playing')) || v4.log.some((e) => e.name === 'ended');
      }, null, { timeout: 60000 });
      await sleep(2000);
      await page.evaluate(() => {
        if (v4.log.some((e) => e.name === 'ended')) return;
        v4.add('probe:seek-to-end');
        v4.player.currentTime(v4.player.duration() - 1);
      });
      // Wait for the post-roll check to finish: an `ended` after `readyforpostroll`.
      await page.waitForFunction(() => {
        const i = v4.log.findIndex((e) => e.name === 'readyforpostroll');
        return i >= 0 && v4.log.slice(i).some((e) => e.name === 'ended');
      }, null, { timeout: 30000 }).catch(() => errors.push('runner: no readyforpostroll + ended within 30 s'));
      await sleep(1000);
    }
  } catch (error) {
    errors.push(`runner: ${error.message.split('\n')[0]}`);
  }
  const { log, settings } = await page.evaluate(() => ({ log: v4.log, settings: v4.settings })).catch(() => ({ log: [], settings: {} }));
  await browser.close();
  return { name, mode, adsInPlaylist: ains ?? 'unset', postrollTimeout: pto ?? 'unset', tag: ar, sourceSet: late ? 'after ima plugin ready' : 'same tick', delayPostrollMs, settings, adRequests, errors, summary: summarizeV4(log), log };
}

function summarizeV4(log) {
  const at = (name, from = 0) => log.find((e) => e.name === name && e.t >= from)?.t;
  const next = at('probe:playNext()');
  const summary = {
    adStarts: log.filter((e) => e.name === 'ads-ad-started').map((e) => e.t),
    playAdBreakCalls: log.filter((e) => e.name === 'playAdBreak()'),
    sourcechanged: log.filter((e) => e.name === 'sourcechanged').map((e) => `${e.t} ${e.src}`),
    imaPluginReadyAt: at('ima-plugin-ready'),
  };
  if (next !== undefined) {
    const changed = at('contentchanged', next);
    Object.assign(summary, {
      item2: {
        contentchangedAfterMs: changed - next,
        adStarted: log.some((e) => e.name === 'ads-ad-started' && e.t >= next),
        adtimeoutAfterContentchangedMs: at('adtimeout', next) !== undefined ? at('adtimeout', next) - changed : null,
        playingAfterContentchangedMs: at('playing', changed ?? next) !== undefined ? at('playing', changed ?? next) - changed : null,
      },
    });
  }
  // The raw tech `ended` is logged just before `readyforpostroll`; look only at events after it.
  const ready = log.findIndex((e) => e.name === 'readyforpostroll');
  const after = (name) => log.slice(ready + 1).find((e) => e.name === name);
  if (ready >= 0) {
    const since = (e) => (e ? e.t - log[ready].t : null);
    Object.assign(summary, {
      postroll: {
        adtimeoutAfterReadyforpostrollMs: since(after('adtimeout')),
        adStarted: Boolean(after('ads-ad-started')),
        nopostroll: Boolean(after('nopostroll')),
        endedAfterReadyforpostrollMs: since(after('ended')),
      },
    });
  }
  return summary;
}

// ---- scenarios ----
const results = { videojs: videojsVersion, date: new Date().toISOString().slice(0, 10), v5: [], v4: [] };
const iPhone = devices['iPhone 13'];
const scenarios = {
  v5: [
    { name: 'C1 negative control: light-DOM ad container before the content <video>', engine: chromium, layout: 'before' },
    { name: 'C1 light-DOM ad container after the content <video>', engine: chromium, layout: 'after' },
    { name: 'C1+C2 shadow-root ad container (host before the content <video>)', engine: chromium, layout: 'shadow' },
    { name: 'extra: shadow layout, Firefox', engine: firefox, layout: 'shadow' },
    { name: 'extra: shadow layout, WebKit', engine: webkit, layout: 'shadow' },
    { name: 'C2 iPhone emulation (WebKit + iPhone UA), disableCustomPlaybackForIOS10Plus default', engine: webkit, layout: 'shadow', device: iPhone },
    { name: 'C2 iPhone emulation (WebKit + iPhone UA), disableCustomPlaybackForIOS10Plus true', engine: webkit, layout: 'shadow', ios: 'true', device: iPhone },
  ],
  v4: [
    { name: 'C3 v4 playlist, adsInPlaylist unset', mode: 'playlist', ar: 'preonly' },
    { name: 'C3 v4 playlist, adsInPlaylist every-video', mode: 'playlist', ar: 'preonly', ains: 'every-video' },
    { name: 'C3 v4 playlist, adsInPlaylist first-video', mode: 'playlist', ar: 'preonly', ains: 'first-video' },
    { name: 'C3 v4 single video, source set in the same tick (as docs/vast-vpaid.html), pre+post-roll tag', mode: 'single', ar: 'premidpost', pto: 1000, delayPostrollMs: 20000 },
    { name: 'C3 v4 single video, source set after the ima plugin started, postrollTimeout 1000, post-roll ad tag held 20 s', mode: 'single', ar: 'premidpost', pto: 1000, late: true, delayPostrollMs: 20000 },
  ],
};
const selected = (key) => scenarios[key].filter((s) => !filter || s.name.includes(filter));

if (only !== 'v4') {
  for (const scenario of selected('v5')) {
    const result = await runV5(scenario);
    results.v5.push(result);
    console.log(`\n## ${result.name} [${result.browser}]`, result.timedOut ? '(timed out)' : '', result.errors.length ? result.errors : '');
    const { eventOrder, ...rest } = result.summary;
    console.log(JSON.stringify(rest, null, 1));
  }
}

if (only !== 'v5') {
  for (const scenario of selected('v4')) {
    const result = await runV4(scenario);
    results.v4.push(result);
    console.log(`\n## ${result.name}`, result.errors.length ? result.errors : '');
    console.log(JSON.stringify({ settings: result.settings, adRequests: result.adRequests, ...result.summary }, null, 1));
  }
}

// Merge into results.json: a scenario that ran now replaces the stored one with the same
// name; stored results of scenarios that no longer exist are dropped.
const file = join(here, 'results.json');
const stored = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { v5: [], v4: [] };
for (const key of ['v5', 'v4']) {
  const names = new Set(scenarios[key].map((s) => s.name));
  stored[key] = stored[key].filter((r) => names.has(r.name));
  for (const result of results[key]) {
    const index = stored[key].findIndex((r) => r.name === result.name);
    if (index >= 0) stored[key][index] = { ...result, date: results.date };
    else stored[key].push({ ...result, date: results.date });
  }
}
writeFileSync(file, `${JSON.stringify({ ...stored, videojs: videojsVersion }, null, 1)}\n`);
console.log('\nwrote spikes/s4-ima/results.json');
