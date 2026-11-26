// S-3 captions spike: own caption renderer (tracks `hidden`) on Video.js 10, v4 styles,
// word highlight, Video.js interference, iPhone native-fullscreen switch.
// Run from the repository root: node spikes/s3-captions/run.mjs [chromium firefox webkit]
// Needs network for the demo video (res.cloudinary.com). Writes captions.vtt and results.json here.
import { build } from 'rolldown';
import { chromium, firefox, webkit } from '@playwright/test';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const version = JSON.parse(readFileSync(new URL(import.meta.resolve('@videojs/html/package.json')), 'utf8')).version;
const VIDEO = 'https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4';
const MAX_WORDS = 3;
const OPTIONS = {
  theme: 'yellow-outlined',
  fontFace: 'Georgia, serif',
  fontSize: '150%',
  gravity: 'bottom',
  style: { 'background-color': 'rgba(0, 0, 128, 0.8)' },
  wordHighlightStyle: { color: 'royalblue', 'text-decoration': 'underline' },
};

// 1. v4 transcript JSON → per-word cues, as v4's transcriptParser does with wordHighlight:
//    one cue per word with that word in <b>, plus an unhighlighted cue for gaps between words.
function transcriptToCues(segments, maxWords) {
  const cues = [];
  for (const { words } of segments) {
    const size = maxWords || words.length;
    for (let i = 0; i < words.length; i += size) {
      const chunk = words.slice(i, i + size);
      chunk.forEach((word, idx) => {
        cues.push({ startTime: word.start_time, endTime: word.end_time, text: chunk.map((w) => (w === word ? `<b>${w.word}</b>` : w.word)).join(' ') });
        const next = words[i + idx + 1]; // v4 reads words[idx + 1] (chunk index): wrong after the first chunk
        if (next && word.end_time < next.start_time) cues.push({ startTime: word.end_time, endTime: next.start_time, text: chunk.map((w) => w.word).join(' ') });
      });
    }
  }
  return cues;
}
const ts = (s) => new Date(s * 1000).toISOString().slice(11, 23);
const cues = transcriptToCues(JSON.parse(readFileSync(join(here, 'transcript.json'), 'utf8')), MAX_WORDS);
writeFileSync(join(here, 'captions.vtt'), `WEBVTT\n\n${cues.map((c) => `${ts(c.startTime)} --> ${ts(c.endTime)}\n${c.text}`).join('\n\n')}\n`);
const strip = (text) => text.replace(/<[^>]+>/g, '');
const expected = [
  ...cues.map((c) => ({ t: +((c.startTime + c.endTime) / 2).toFixed(3), text: strip(c.text), word: c.text.match(/<b>(.*?)<\/b>/)?.[1] ?? null })),
  ...[0.5, 4.2, 9].map((t) => ({ t, text: '', word: null })),
];

// 2. Bundle page.js and serve it, the page and the VTT from memory.
const { output } = await build({ input: join(here, 'page.js'), platform: 'browser', logLevel: 'warn', write: false, output: { format: 'esm' } });
const entry = output.find((o) => o.type === 'chunk' && o.isEntry).fileName;
const CSS = `
  body { margin: 0; background: #222; }
  cld-spike-player { display: block; width: 640px; }
  media-container { display: block; position: relative; }
  video { display: block; width: 100%; aspect-ratio: 16 / 9; }
  #vjs-cc, #vjs-fs { position: absolute; top: 8px; z-index: 2; padding: 4px 8px; background: #fff; }
  #vjs-cc { left: 8px; } #vjs-fs { left: 64px; }
  /* Stand-in for the v5 skin CSS (port of v4 styled-text-tracks.scss). */
  .cld-cc { position: absolute; inset: 0; z-index: 1; pointer-events: none; box-sizing: border-box; padding: 4% 4% 6%;
    display: flex; flex-direction: column; justify-content: flex-end; align-items: center; text-align: center;
    font: 18px/1.3 sans-serif; white-space: pre-line; }
  .cld-cc-cue { color: #fff; background-color: rgba(0, 0, 0, 0.6); padding: 0.1em 0.4em; }
  .cld-cc-gravity-top { justify-content: flex-start; }
  .cld-cc-gravity-center { justify-content: center; }
  .cld-cc-gravity-left { align-items: flex-start; text-align: left; }
  .cld-cc-gravity-right { align-items: flex-end; text-align: right; }
  .cld-cc-theme-yellow-outlined .cld-cc-cue { color: #fef94a; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; }
  .cld-cc-theme-player-colors .cld-cc-cue { color: var(--color-text, #fff); background-color: var(--color-accent, #0d9aff); text-shadow: 0 0 4px var(--color-base, #000); }
`;
const HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>S-3 captions</title><style>${CSS}</style></head><body>
<cld-spike-player>
  <media-container>
    <video muted playsinline preload="auto" src="${VIDEO}">
      <track id="en" kind="captions" label="English" srclang="en" src="/captions.vtt" default>
    </video>
    <media-captions-button id="vjs-cc">CC</media-captions-button>
    <media-fullscreen-button id="vjs-fs">FS</media-fullscreen-button>
    <media-hotkey keys="c" action="toggleSubtitles" target="document"></media-hotkey>
  </media-container>
</cld-spike-player>
<script type="module" src="/${entry}"></script>
</body></html>`;
// Public HLS stream with one in-manifest WebVTT subtitles group (DEFAULT=YES), played by hls.js (MSE).
const HLS = 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8';
const files = new Map([
  ['/', { type: 'text/html', body: HTML }],
  ['/hls', { type: 'text/html', body: HTML.replace(/<video[\s\S]*?<\/video>/, `<hlsjs-video muted playsinline src="${HLS}"></hlsjs-video>`) }],
  ['/captions.vtt', { type: 'text/vtt', body: readFileSync(join(here, 'captions.vtt'), 'utf8') }],
  ...output.map((o) => [`/${o.fileName}`, { type: 'text/javascript', body: o.type === 'chunk' ? o.code : o.source }]),
]);
const server = createServer((req, res) => {
  const file = files.get(req.url.split('?')[0]);
  res.writeHead(file ? 200 : 404, { 'content-type': file?.type ?? 'text/plain' }).end(file?.body ?? 'not found');
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;

// Page helpers (installed before page scripts).
function helpers() {
  const video = () => document.querySelector('video');
  const h = {
    video,
    store: () => document.querySelector('cld-spike-player').store,
    container: () => document.querySelector('media-container'),
    track: (lang) => Array.from(video().textTracks).find((t) => t.language === lang),
    settle: () => new Promise((r) => setTimeout(() => requestAnimationFrame(() => r()), 50)),
    async waitFor(pred, ms = 3000) {
      const end = performance.now() + ms;
      while (performance.now() < end) {
        if (pred()) return true;
        await new Promise((r) => setTimeout(r, 16));
      }
      return !!pred();
    },
    seek: (t) => new Promise((r) => { video().addEventListener('seeked', r, { once: true }); video().currentTime = t; }),
    text: (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    modes: () => Object.fromEntries(window.spike.captionTracks(video()).map((t) => [t.language, t.mode])),
    snapshot: () => ({
      modes: h.modes(),
      subtitlesShowing: h.store().subtitlesShowing,
      builtInButtonActive: document.querySelector('#vjs-cc').hasAttribute('data-active'),
      overlay: h.text(window.captions?.overlay),
      active: window.captions?.active?.language ?? null,
    }),
    recreate(opts) {
      window.captions?.destroy();
      window.captions = window.spike.createCaptions({ media: video(), container: h.container(), pacedTracks: window.paced, ...opts });
      return window.captions;
    },
  };
  window.h = h;
}

async function runEngine(name, engine) {
  const browser = await engine.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(helpers);
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.spike && document.querySelector('video').readyState >= 1, null, { timeout: 30000 });
  const r = { engine: name, browserVersion: browser.version() };

  // Setup: `<track default>` → does the browser select it? Our renderer claims it (→ hidden).
  r.setup = await page.evaluate(async (options) => {
    const v = h.video();
    const en = h.track('en');
    await h.waitFor(() => en.mode === 'showing', 3000);
    const out = { videoError: v.error?.code ?? null, duration: v.duration, enModeFromDefault: en.mode, subtitlesShowingFromDefault: h.store().subtitlesShowing };
    const es = v.addTextTrack('subtitles', 'Español', 'es');
    out.addTextTrackInitialMode = es.mode;
    [[1.0, 3.4, 'Las tortugas marinas se deslizan'], [5.0, 7.0, 'y suben a respirar']].forEach(([s, e, t]) => es.addCue(new VTTCue(s, e, t)));
    window.paced = new WeakSet([en]);
    h.recreate({ options });
    out.claimedDefault = window.captions.active === en;
    if (!window.captions.active) window.captions.select(en);
    await h.waitFor(() => en.cues?.length > 0);
    await h.settle();
    out.enCues = en.cues.length;
    out.afterCreate = h.snapshot();
    return out;
  }, OPTIONS);

  // Criterion 1/4: rendered text + highlighted word at each cue midpoint and in gaps.
  r.seekChecks = await page.evaluate(async (list) => {
    const out = [];
    for (const { t, text, word } of list) {
      await h.seek(t);
      const read = () => ({ text: h.text(window.captions.overlay), word: h.text(window.captions.overlay.querySelector('.cld-cc-word')) || null });
      const ok = await h.waitFor(() => read().text === text && read().word === word, 2000);
      out.push({ t, ok, expected: { text, word }, actual: read() });
    }
    return out;
  }, expected);

  // Styles at 1.55 s ("turtles" highlighted).
  r.styles = await page.evaluate(async () => {
    await h.seek(1.55);
    await h.waitFor(() => window.captions.overlay.querySelector('.cld-cc-word'));
    const cue = window.captions.overlay.querySelector('.cld-cc-cue');
    const word = cue.querySelector('.cld-cc-word');
    const cs = getComputedStyle(cue);
    const ws = getComputedStyle(word);
    return {
      color: cs.color, backgroundColor: cs.backgroundColor, fontFamily: getComputedStyle(window.captions.overlay).fontFamily, fontSize: cs.fontSize,
      textShadow: cs.textShadow !== 'none', wordElement: `${word.localName} ${word.namespaceURI}`, wordColor: ws.color, wordDecoration: ws.textDecorationLine,
    };
  });

  // Overlay paints above the video: screenshots of the cue box with/without overlay and video.
  const rect = await page.evaluate(() => {
    const b = window.captions.overlay.querySelector('.cld-cc-cue').getBoundingClientRect();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  });
  const shot = () => page.screenshot({ clip: rect });
  const withOverlay = await shot();
  await page.evaluate(() => { window.captions.overlay.style.visibility = 'hidden'; });
  const withoutOverlay = await shot();
  await page.evaluate(() => { h.video().style.visibility = 'hidden'; });
  const withoutVideo = await shot();
  await page.evaluate(() => { window.captions.overlay.style.visibility = ''; h.video().style.visibility = ''; });
  r.paint = { overlayPaints: !withOverlay.equals(withoutOverlay), videoPaints: !withoutOverlay.equals(withoutVideo) };
  r.paint.containerContainsOverlay = await page.evaluate(() => h.container().contains(window.captions.overlay));

  // Element fullscreen through the built-in button (targets <media-container>).
  await page.click('#vjs-fs').catch((e) => errors.push(`fullscreen click: ${e.message}`));
  r.fullscreen = await page.evaluate(async () => {
    await h.waitFor(() => document.fullscreenElement, 3000);
    const el = document.fullscreenElement;
    const o = window.captions.overlay.getBoundingClientRect();
    const out = { element: el?.localName ?? null, containsOverlay: !!el?.contains(window.captions.overlay), overlaySize: [Math.round(o.width), Math.round(o.height)], viewport: [innerWidth, innerHeight], overlayText: h.text(window.captions.overlay) };
    if (el) await document.exitFullscreen().catch(() => {});
    await h.waitFor(() => !document.fullscreenElement, 3000);
    return out;
  });

  // Gravity and box (layout relative to the container).
  r.layout = await page.evaluate(async (base) => {
    const out = {};
    const c = h.container().getBoundingClientRect();
    const cases = { bottom: {}, top: { gravity: 'top' }, center: { gravity: 'center' }, 'bottom-right': { gravity: 'bottom-right' }, box: { box: { x: '10%', y: '10%', width: '50%', height: '50%' } } };
    for (const [key, opts] of Object.entries(cases)) {
      h.recreate({ options: { ...base, ...opts } }).select(h.track('en'));
      await h.waitFor(() => window.captions.overlay.querySelector('.cld-cc-cue'));
      const q = window.captions.overlay.querySelector('.cld-cc-cue').getBoundingClientRect();
      const o = window.captions.overlay.getBoundingClientRect();
      const round = (n) => Math.round(n * 1000) / 1000;
      out[key] = {
        cueCenterY: round((q.top + q.height / 2 - c.top) / c.height), cueRightGap: round((c.right - q.right) / c.width),
        overlay: { left: round((o.left - c.left) / c.width), top: round((o.top - c.top) / c.height), width: round(o.width / c.width), height: round(o.height / c.height) },
      };
    }
    return out;
  }, OPTIONS);

  // Highlight timing at 1x: currentTime − cue.startTime when a word cue renders (cuechange only, no rAF).
  r.timing = await page.evaluate(async () => {
    const v = h.video();
    const lags = [];
    const seen = new Set();
    let playing = false; // ignore the render select() does at the paused position
    h.recreate({ options: {}, onRender: (list) => { if (playing && list[0]) { lags.push(v.currentTime - list[0].startTime); seen.add(`${list[0].startTime}|${list[0].text}`); } } }).select(h.track('en'));
    await h.seek(0.5);
    playing = true;
    await v.play();
    await h.waitFor(() => v.currentTime >= 7.3, 15000);
    v.pause();
    return { lags, renderedCues: seen.size, totalCues: h.track('en').cues.length };
  });

  // Criterion 2: raw Video.js 10 behavior with our track `hidden` (claimShowing off, so nothing re-claims).
  r.vjs = await page.evaluate(async () => {
    const v = h.video();
    const store = h.store();
    const en = h.track('en');
    h.recreate({ claimShowing: false });
    await h.seek(1.55);
    const idOf = (lang) => store.textTrackList.find((t) => t.language === lang)?.id;
    const steps = [];
    const step = async (label, action) => {
      window.captions.select(en);
      await h.settle();
      const before = h.snapshot();
      await action();
      await h.settle();
      steps.push({ label, before, after: h.snapshot() });
    };
    await step('ours: select(en)', async () => {});
    await step('passive: play 1 s, pause, seek', async () => { await v.play(); await new Promise((res) => setTimeout(res, 1000)); v.pause(); await h.seek(1.55); });
    await step('store.toggleSubtitles()', () => store.toggleSubtitles());
    await step('store.toggleSubtitles(false)', () => store.toggleSubtitles(false));
    await step('store.toggleSubtitles(true)', () => store.toggleSubtitles(true));
    await step(`store.selectSubtitlesTrack('${idOf('es')}')`, () => store.selectSubtitlesTrack(idOf('es')));
    await step('store.selectSubtitlesTrack(null)', () => store.selectSubtitlesTrack(null));
    await step('passive: new src (reload, <track default>)', async () => {
      const loaded = new Promise((res) => v.addEventListener('loadedmetadata', res, { once: true }));
      v.src = `${v.currentSrc.split('?')[0]}?reload=1`;
      await loaded;
      await new Promise((res) => setTimeout(res, 1000));
      await h.seek(1.55);
    });
    return { textTrackListIds: store.textTrackList.map((t) => t.id), steps };
  });
  for (const [label, act] of [['built-in <media-captions-button> click', () => page.click('#vjs-cc')], ["<media-hotkey keys='c'> press", () => page.keyboard.press('c')]]) {
    const before = await page.evaluate(async () => { window.captions.select(h.track('en')); await h.settle(); return h.snapshot(); });
    await act();
    const after = await page.evaluate(async () => { await h.settle(); return h.snapshot(); });
    r.vjs.steps.push({ label, before, after });
  }
  // Same click with our claim policy on: the button can turn captions on, never off.
  r.vjs.claimOn = [];
  await page.evaluate(async () => { h.recreate({}).select(h.track('en')); await h.settle(); });
  for (let i = 0; i < 2; i++) {
    await page.click('#vjs-cc');
    r.vjs.claimOn.push(await page.evaluate(async () => { await h.settle(); await h.settle(); return h.snapshot(); }));
  }

  // Probe: a paused track goes disabled → hidden, then (no seek | seek to the same time | seek elsewhere).
  r.reselectProbe = await page.evaluate(async () => {
    const v = h.video();
    const en = h.track('en');
    const out = {};
    for (const [label, to] of [['no seek', null], ['seek to same time', 'same'], ['seek to 1.6 s', 1.6]]) {
      h.recreate({}).select(null);
      await h.seek(1.55);
      await h.settle();
      window.captions.select(en);
      if (to) await h.seek(to === 'same' ? v.currentTime : to);
      out[label] = { shown: await h.waitFor(() => h.text(window.captions.overlay), 1500), activeCues: en.activeCues?.length ?? null };
    }
    return out;
  });

  // Criterion 3: simulated iPhone native fullscreen events on the <video>.
  r.ios = await page.evaluate(async () => {
    const v = h.video();
    const en = h.track('en');
    const es = h.track('es');
    h.recreate({}).select(en);
    await h.seek(1.55);
    const shown = await h.waitFor(() => h.text(window.captions.overlay));
    const fire = async (type) => { v.dispatchEvent(new Event(type)); await h.settle(); };
    const out = { inline: { ...h.snapshot(), shown, enActiveCues: en.activeCues?.length ?? null } };
    await fire('webkitbeginfullscreen'); out.begin = h.snapshot();
    await fire('webkitendfullscreen'); out.end = h.snapshot();
    await fire('webkitbeginfullscreen'); en.mode = 'disabled'; es.mode = 'showing'; await h.settle(); out.nativeMenuPicksEs = h.snapshot();
    await fire('webkitendfullscreen'); out.endAfterEs = h.snapshot();
    await fire('webkitbeginfullscreen'); es.mode = 'disabled'; await h.settle();
    await fire('webkitendfullscreen'); out.endAfterOff = h.snapshot();
    await fire('webkitbeginfullscreen'); out.beginWhileOff = h.snapshot();
    return out;
  });
  // While "in native fullscreen" with captions off: does the browser draw the track once it is `showing`?
  const videoBox = await page.evaluate(() => {
    const b = h.video().getBoundingClientRect();
    return { x: b.x, y: b.y + b.height * 0.6, width: b.width, height: b.height * 0.4 };
  });
  const offShot = await page.screenshot({ clip: videoBox });
  await page.evaluate(async () => { h.track('en').mode = 'showing'; await h.settle(); await h.settle(); });
  const onShot = await page.screenshot({ clip: videoBox });
  r.ios.nativeDrawsShowingTrack = !offShot.equals(onShot);
  r.ios.endAfterOn = await page.evaluate(async () => { h.video().dispatchEvent(new Event('webkitendfullscreen')); await h.settle(); return h.snapshot(); });

  // Video.js 10.7 app captions track (store.addTextTrack; not in 10.3.0): can we keep its media copy `hidden`?
  r.appTrack = await page.evaluate(async () => {
    const store = h.store();
    const v = h.video();
    if (!store.addTextTrack) return { available: false };
    h.recreate({ claimShowing: false });
    const handle = store.addTextTrack({ kind: 'captions', label: 'App', language: 'fr', cues: [{ startTime: 1, endTime: 3.4, text: 'Les tortues' }] });
    const found = await h.waitFor(() => v.querySelector(`track#${handle.id}`), 2000);
    if (!found) return { available: true, copyFound: false };
    const copy = v.querySelector(`track#${handle.id}`).track;
    const out = { available: true, copyFound: true, copyInitialMode: copy.mode };
    window.captions.select(copy);
    out.rightAfterSelect = copy.mode;
    await new Promise((res) => setTimeout(res, 500));
    out.after500ms = copy.mode;
    window.captions.select(copy);
    await h.settle();
    out.afterReselect = copy.mode;
    out.storeListMode = store.textTrackList.find((t) => t.id === handle.id)?.mode;
    out.overlay = h.text(window.captions.overlay);
    handle.remove();
    return out;
  });

  r.errors = errors;
  await browser.close();
  return r;
}

// <hlsjs-video> sets hls.js `engine.subtitleTrack` only from a `showing` track (text-tracks.js in
// @videojs/hlsjs-video). Does a `hidden` in-manifest track still get its cues?
async function runHls(name, engine) {
  const browser = await engine.launch();
  // Two fresh page loads: cues hls.js loaded while the claim-on probe had subtitleTrack 0 would leak into `hiddenOnly`.
  const run = async (claimOnLoad) => {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    await page.addInitScript(helpers);
    await page.goto(`${base}hls`, { waitUntil: 'domcontentloaded' });
    const out = await page.evaluate(async (claimOnLoad) => {
      const media = document.querySelector('hlsjs-video');
      const sub = () => Array.from(media.textTracks ?? []).find((t) => t.kind === 'subtitles' || t.kind === 'captions');
      const ready = await h.waitFor(() => window.spike && media.engine && sub(), 30000);
      if (!ready) return { ready, engineName: media.engineName ?? null };
      const result = { ready, engineName: media.engineName, initial: { mode: sub().mode, subtitleTrack: media.engine.subtitleTrack } };
      const probe = async (label, at) => {
        media.currentTime = at;
        await media.play().catch(() => {});
        await new Promise((r) => setTimeout(r, 6000));
        media.pause();
        const near = Array.from(sub().cues ?? []).filter((c) => c.startTime >= at - 2 && c.startTime <= at + 12).length;
        result[label] = { mode: sub().mode, subtitleTrack: media.engine.subtitleTrack, cuesNearPlayhead: near, overlay: h.text(window.captions.overlay) };
      };
      if (claimOnLoad) {
        // Common path: the DEFAULT=YES track starts `showing`; our claim policy (on from load) turns it `hidden`.
        window.captions = window.spike.createCaptions({ media, container: h.container() });
        await probe('defaultClaimed', 30);
        // createCaptions listens on <hlsjs-video>; its event bridge forwards listened types from the inner <video>.
        const inner = media.querySelector('video') ?? media.shadowRoot?.querySelector('video');
        inner.dispatchEvent(new Event('webkitbeginfullscreen'));
        await h.settle();
        result.bridgedBegin = { mode: sub().mode, overlay: h.text(window.captions.overlay) };
        inner.dispatchEvent(new Event('webkitendfullscreen'));
        await h.settle();
        result.bridgedEnd = { mode: sub().mode };
        return result;
      }
      window.captions = window.spike.createCaptions({ media, container: h.container(), claimShowing: false });
      // A track hls.js has not selected (any non-default language, or after "off"): subtitleTrack = -1.
      window.captions.select(null);
      media.engine.subtitleTrack = -1;
      window.captions.select(sub());
      await probe('hiddenOnly', 60);
      media.engine.subtitleTrack = 0; // workaround: drive hls.js ourselves (engine is a documented escape hatch)
      await probe('hiddenPlusEngineSubtitleTrack', 120);
      window.captions.select(null);
      media.engine.subtitleTrack = -1;
      sub().mode = 'showing'; // reference: what the built-in controls do
      await h.settle();
      await probe('showing', 180);
      return result;
    }, claimOnLoad);
    await page.close();
    return out;
  };
  const claimOn = await run(true);
  const claimOff = await run(false);
  await browser.close();
  return { claimOn, claimOff };
}

// 3. Verdicts.
const want = (value, expectedValue) => JSON.stringify(value) === JSON.stringify(expectedValue);
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const ms = (n) => (n == null ? null : Math.round(n * 1000));
function verdicts(r) {
  const c1 = {
    seek: r.seekChecks.every((c) => c.ok),
    styles: r.styles.color === 'rgb(254, 249, 74)' && r.styles.backgroundColor === 'rgba(0, 0, 128, 0.8)' && r.styles.fontFamily.startsWith('Georgia')
      && r.styles.fontSize === '27px' && r.styles.textShadow && r.styles.wordColor === 'rgb(65, 105, 225)' && r.styles.wordDecoration === 'underline',
    paint: r.paint.overlayPaints && r.paint.containerContainsOverlay,
    layout: r.layout.bottom.cueCenterY > 0.75 && r.layout.top.cueCenterY < 0.25 && Math.abs(r.layout.center.cueCenterY - 0.5) < 0.1
      && r.layout['bottom-right'].cueRightGap < 0.06 && Math.abs(r.layout.box.overlay.width - 0.5) < 0.01 && Math.abs(r.layout.box.overlay.left - 0.05) < 0.01,
  };
  const ios = r.ios;
  const c3 = want(ios.begin.modes, { en: 'showing', es: 'disabled' }) && ios.begin.overlay === '' && ios.begin.subtitlesShowing
    && want(ios.end.modes, { en: 'hidden', es: 'disabled' }) && ios.end.overlay !== ''
    && want(ios.endAfterEs.modes, { en: 'disabled', es: 'hidden' }) && ios.endAfterEs.active === 'es' && ios.endAfterEs.overlay.startsWith('Las tortugas')
    && want(ios.endAfterOff.modes, { en: 'disabled', es: 'disabled' }) && ios.endAfterOff.active === null && ios.endAfterOff.overlay === ''
    && want(ios.endAfterOn.modes, { en: 'hidden', es: 'disabled' }) && ios.endAfterOn.active === 'en';
  return { c1: Object.values(c1).every(Boolean), c1Parts: c1, c3, lagMs: { median: ms(median(r.timing.lags)), max: ms(Math.max(...r.timing.lags)), min: ms(Math.min(...r.timing.lags)) } };
}

const engines = { chromium, firefox, webkit };
const selected = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(engines);
const results = { videojs: version, video: VIDEO, maxWords: MAX_WORDS, cues: cues.length, engines: {} };
try {
  for (const name of selected) {
    const r = await runEngine(name, engines[name]);
    r.verdicts = verdicts(r);
    results.engines[name] = r;
    const v = r.verdicts;
    console.log(`${name} ${r.browserVersion}: c1=${v.c1} ${JSON.stringify(v.c1Parts)} c3=${v.c3} lag(ms) median=${v.lagMs.median} max=${v.lagMs.max} rendered ${r.timing.renderedCues}/${r.timing.totalCues} cues, errors=${r.errors.length}`);
    for (const s of r.vjs.steps) console.log(`  ${s.label}: ${JSON.stringify(s.before.modes)} → ${JSON.stringify(s.after.modes)} subtitlesShowing=${s.after.subtitlesShowing} button=${s.after.builtInButtonActive} overlay="${s.after.overlay}"`);
    r.hls = await runHls(name, engines[name]).catch((e) => ({ error: e.message }));
    console.log(`  <hlsjs-video> in-manifest subtitles: ${JSON.stringify(r.hls)}`);
  }
} finally {
  server.close();
}
writeFileSync(join(here, 'results.json'), `${JSON.stringify(results, null, 2)}\n`);
