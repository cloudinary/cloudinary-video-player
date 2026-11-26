// S-5 DASH spike: bundle page.js with Rolldown, serve it in-process, and drive <dash-video> in headless
// browsers against public DASH streams. Writes results-<videojs version>.json next to this file.
// Run from the repository root: node spikes/s5-dash/run.mjs [chromium] [firefox] [webkit]
import { build } from 'rolldown';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from '@playwright/test';

const here = dirname(fileURLToPath(import.meta.url));
const CLD = 'https://res.cloudinary.com/demo/video/upload/sp_full_hd/sea_turtle.mpd';
const MULTI = 'https://dash.akamaized.net/dash264/TestCases/10a/1/iis_forest_short_poem_multi_lang_480p_single_adapt_aaclc_sidx.mpd';
// v4 adaptiveStreaming.strategy values, mapped to dash.js keys by this spike (v4 feeds them to hls.js only).
const PRESETS = {
  dashjsDefault: null,
  fastStart: { streaming: { abr: { limitBitrateByPortal: true, usePixelRatioInLimitBitrateByPortal: false, initialBitrate: { video: 1 } } } },
  balanced: { streaming: { abr: { limitBitrateByPortal: true, usePixelRatioInLimitBitrateByPortal: false, initialBitrate: { video: 4096 } } } },
  highQuality: { streaming: { abr: { limitBitrateByPortal: true, usePixelRatioInLimitBitrateByPortal: true, initialBitrate: { video: 4096 } } } },
  maxBitrate600: { streaming: { abr: { initialBitrate: { video: 4096 }, maxBitrate: { video: 600 } } } },
};

const version = JSON.parse(readFileSync(new URL(import.meta.resolve('@videojs/html/package.json')), 'utf8')).version;
const engines = { chromium, firefox, webkit };
const wanted = process.argv.slice(2).filter((a) => a in engines);
const names = wanted.length ? wanted : Object.keys(engines);

// Build in memory and serve from memory: nothing lands on disk but the results file.
const { output } = await build({ input: join(here, 'page.js'), platform: 'browser', logLevel: 'warn', write: false, output: { format: 'esm' } });
const files = new Map(output.map((o) => [`/${o.fileName}`, o.code ?? o.source]));
const entry = output.find((o) => o.type === 'chunk' && o.isEntry).fileName;
files.set('/', `<!doctype html><meta charset="utf-8"><body></body><script type="module" src="/${entry}"></script>`);
const server = createServer((req, res) => {
  const body = files.get(req.url);
  if (body === undefined) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': req.url === '/' ? 'text/html' : 'text/javascript' }).end(body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}/`;

const results = { videojs: version, streams: { quality: CLD, audio: MULTI }, browsers: {}, scenarios: {} };

async function withPage(browser, { dpr = 1 } = {}, fn) {
  // A fresh context per scenario: dash.js caches the last bitrate and track in localStorage.
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: dpr });
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on('request', (r) => requests.push(r.url()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(origin);
  await page.waitForFunction(() => window.s5);
  try {
    return { ...(await fn(page, requests)), errors: errors.slice(0, 5) };
  } catch (error) {
    return { failed: error.message.split('\n')[0], errors: errors.slice(0, 5) };
  } finally {
    await context.close();
  }
}

const snap = (page) => page.evaluate(() => window.s5.snapshot());
// Poll a browser-side condition; record whether it held and how long it took instead of throwing.
async function until(page, fn, arg, timeout = 30000) {
  const start = Date.now();
  try {
    await page.waitForFunction(fn, arg, { timeout, polling: 250 });
    return { ok: true, ms: Date.now() - start };
  } catch {
    return { ok: false, ms: Date.now() - start };
  }
}
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const count = (requests, part) => requests.filter((u) => u.includes(part)).length;

async function quality(page) {
  await page.evaluate((src) => window.s5.mount({ src }), CLD);
  const listed = await until(page, () => window.s5.snapshot().store.videoRenditionList.length > 1);
  const s0 = await snap(page);
  const list = [...s0.store.videoRenditionList].sort((a, b) => a.height - b.height);
  const [low, mid, high] = [list[0], list.find((r) => r.height === 360) ?? list[1], list.at(-1)];
  const pinned = (id, height) => until(page, ([i, h]) => {
    const s = window.s5.snapshot();
    return s.engine.currentVideoRep?.id === i && s.videoHeight === h;
  }, [id, height]);
  const pick = (s) => ({ engineRep: s.engine.currentVideoRep, videoHeight: s.videoHeight, autoSwitchVideo: s.engine.abr.autoSwitchBitrate.video, storeActive: s.store.activeVideoRendition?.id, storeSelected: s.store.videoRenditionList.filter((r) => r.selected).map((r) => r.id) });
  const out = {
    engineVersion: s0.engineVersion,
    listed,
    storeList: s0.store.videoRenditionList,
    qualityMenu: s0.qualityMenu,
    engineReps: s0.engine.videoReps,
  };
  // Store's view of the playing rendition at start, against the engine and the decoded frame size.
  await until(page, () => window.s5.snapshot().log.some((e) => e.ev === 'canplay'));
  await pause(500);
  out.atStart = pick(await snap(page));

  await page.evaluate((id) => window.s5.selectRendition(id), low.id);
  out.storePinLowest = { target: low.id, ...(await pinned(low.id, low.height)), ...pick(await snap(page)) };
  await page.evaluate((id) => window.s5.selectRendition(id), high.id);
  out.storePinHighest = { target: high.id, ...(await pinned(high.id, high.height)), ...pick(await snap(page)) };

  // Change the documented engine config while pinned: the adapter resets dash.js settings, then must re-pin.
  await page.evaluate(() => window.s5.setDashJs({ streaming: { buffer: { bufferTimeAtTopQuality: 31 } } }));
  await pause(2000);
  let s = await snap(page);
  out.pinSurvivesDashJsChange = { ...pick(s), bufferTimeAtTopQuality: s.engine.bufferTimeAtTopQuality };

  // A direct engine.updateSettings() is dropped by the next source.engine.dashJs change (resetSettings).
  await page.evaluate(() => window.s5.engineUpdateSettings({ streaming: { abr: { maxBitrate: { video: 777 } } } }));
  const before = (await snap(page)).engine.abr.maxBitrate.video;
  await page.evaluate(() => window.s5.setDashJs({ streaming: { buffer: { bufferTimeAtTopQuality: 32 } } }));
  out.directUpdateSettingsAfterSourceChange = { before, after: (await snap(page)).engine.abr.maxBitrate.video };

  await page.evaluate(() => window.s5.selectRendition('auto'));
  const auto = await until(page, () => window.s5.snapshot().engine.abr.autoSwitchBitrate.video === true, undefined, 10000);
  out.storeAuto = { ...auto, ...pick(await snap(page)) };

  // Criterion 2 path: pin through the dash.js engine directly, bypassing the store.
  await page.evaluate((id) => window.s5.enginePinVideo(id), mid.id);
  out.enginePin = { target: mid.id, ...(await pinned(mid.id, mid.height)), ...pick(await snap(page)) };
  await page.evaluate(() => window.s5.selectRendition('auto'));
  await pause(1500);
  out.storeAutoAfterEnginePin = pick(await snap(page));
  out.log = (await snap(page)).log;
  return out;
}

const audioPick = (s, requests) => ({
  storeAudioTrackList: s.store.audioTrackList,
  audioMenu: s.audioMenu,
  elementAudioTracks: s.elementAudioTracks,
  engineCurrent: s.engine.currentAudioTrack?.lang,
  requestsEn: count(requests, '-en-'),
  requestsDe: count(requests, '-de-'),
});
const playing = (page) => until(page, () => {
  const s = window.s5.snapshot();
  return s.engine.audioTracks.length > 1 && s.currentTime > 1;
});

async function audioBuiltIn(page, requests) {
  await page.evaluate((src) => window.s5.mount({ src }), MULTI);
  const started = await playing(page);
  await pause(1000);
  const s0 = await snap(page);
  const out = { started, engineAudioTracks: s0.engine.audioTracks, ...audioPick(s0, requests) };
  // Criterion 2 path: switch the audio track through the dash.js engine.
  await page.evaluate(() => window.s5.engineSetAudio('de'));
  const switched = await until(page, () => window.s5.snapshot().log.filter((e) => e.ev === 'trackChangeRendered' && e.type === 'audio').at(-1)?.lang === 'de');
  await pause(3000);
  out.engineSwitchToDe = { ...switched, ...audioPick(await snap(page), requests) };
  return out;
}

async function audioBridge(page, requests) {
  await page.evaluate((src) => window.s5.mount({ src }), MULTI);
  const started = await playing(page);
  const before = audioPick(await snap(page), requests);
  const bridged = await page.evaluate(() => window.s5.bridgeAudio()); // attached after the stream started
  const filled = await until(page, () => window.s5.snapshot().store.audioTrackList.length === 2, undefined, 5000);
  const s1 = await snap(page);
  const out = { started, beforeBridge: before, bridged, filled, afterBridge: audioPick(s1, requests) };
  const id = (lang) => s1.store.audioTrackList.find((t) => t.language === lang)?.id;
  const select = async (lang) => {
    await page.evaluate((v) => window.s5.selectAudio(v), id(lang));
    const ok = await until(page, (l) => {
      const s = window.s5.snapshot();
      return s.engine.currentAudioTrack?.lang === l
        && s.log.filter((e) => e.ev === 'trackChangeRendered' && e.type === 'audio').at(-1)?.lang === l
        && s.store.audioTrackList.find((t) => t.enabled)?.language === l;
    }, lang);
    await pause(3000);
    return { ...ok, ...audioPick(await snap(page), requests) };
  };
  out.storeSelectDe = await select('de');
  out.storeSelectEn = await select('en');
  return out;
}

async function abrPreset(page, requests, preset) {
  await page.evaluate(([src, dashJs]) => window.s5.mount({ src, dashJs }), [CLD, preset]);
  const started = await until(page, () => window.s5.snapshot().log.some((e) => e.ev === 'canplay'));
  await pause(12000);
  const s = await snap(page);
  const videoSwitches = s.log.filter((e) => e.ev === 'qualityChangeRendered' && e.type === 'video');
  return {
    started,
    settings: s.engine.abr,
    clientSize: s.clientSize,
    devicePixelRatio: s.devicePixelRatio,
    // Cloudinary segment URLs carry the rendition width (w_<n>): the order of fetches shows the true start.
    firstVideoFetchWidths: requests.filter((u) => u.includes('.mp4dv')).slice(0, 6).map((u) => Number(/w_(\d+)/.exec(u)?.[1])),
    firstRepAtCanplay: s.log.find((e) => e.ev === 'canplay'),
    requested: s.log.filter((e) => e.ev === 'qualityChangeRequested' && e.type === 'video').map((e) => `${e.from}->${e.id}`),
    videoSwitches,
    maxHeightSeen: Math.max(s.log.find((e) => e.ev === 'canplay')?.height ?? 0, ...videoSwitches.map((e) => e.height ?? 0)),
    currentTime: s.currentTime,
  };
}

for (const name of names) {
  const browser = await engines[name].launch();
  results.browsers[name] = browser.version();
  const run = (fn, opts) => withPage(browser, opts, fn);
  // If MSE rejected these codecs, dash.js would filter every representation and fake a "no".
  const r = { codecs: await run((page) => page.evaluate(() => ({
    avcHigh: MediaSource.isTypeSupported('video/mp4; codecs="avc1.640028"'),
    avcBaseline: MediaSource.isTypeSupported('video/mp4; codecs="avc1.42c01e"'),
    aacLc: MediaSource.isTypeSupported('audio/mp4; codecs="mp4a.40.2"'),
    nativeAudioTracks: 'audioTracks' in HTMLMediaElement.prototype,
  }))) };
  console.log(`[${name}] quality`);
  r.quality = await run(quality);
  console.log(`[${name}] audio (built-in)`);
  r.audioBuiltIn = await run(audioBuiltIn);
  console.log(`[${name}] audio (own bridge)`);
  r.audioBridge = await run(audioBridge);
  if (name === 'chromium') {
    r.abrPresets = {};
    for (const [preset, dashJs] of Object.entries(PRESETS)) {
      console.log(`[${name}] abr ${preset}`);
      r.abrPresets[preset] = await run((page, requests) => abrPreset(page, requests, dashJs), { dpr: 2 });
    }
  }
  results.scenarios[name] = r;
  await browser.close();
}

server.close();
const file = join(here, `results-${version}.json`);
writeFileSync(file, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
