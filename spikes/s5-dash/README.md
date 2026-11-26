# S-5 — DASH quality menu, audio-track menu and ABR presets on Video.js 10 (T008)

## Question

Can v5 offer DASH quality and audio-track menus and ABR presets on Video.js 10's `<dash-video>` (dash.js 5)?

What v4 offers today (this repo's `src/`, from code reading only, not run):

- **Quality menu for DASH:** yes. `src/plugins/adaptive-streaming/quality-levels.js` reads the dash.js bitrate list. A pin turns off ABR for video and audio, and maps an audio quality in proportion (`audioMapper`).
- **Audio-track menu for DASH:** `videojs-contrib-dash` (`setup-audio-tracks.js`) mirrors `getTracksFor('audio')` into `player.audioTracks()` and switches with `setCurrentTrack`. `src/video-player.utils.js` keeps the Video.js 8 default `audioTrackButton` in the control bar.
- **ABR presets** (`adaptiveStreaming.strategy`: `fastStart`, `balanced`, `highQuality`): **HLS only.** `abr-strategies.js` is hls.js config and goes only to `hlsjsConfig`. DASH ignores it, so **any dash.js preset in v5 is new behaviour**, not parity.

## Method

- **Versions:** `@videojs/html` and `@videojs/dash-video` **10.7.0**. dash.js **5.2.0** is the copy nested under `@videojs/dash-video` (the runtime `engine.getVersion()` confirms it). The plan pins 10.3.0, which is not installed here (see results).
- **Engines:** headless Playwright 1.60: Chromium 148, Firefox 150 and WebKit 26.4. A codec probe in each run (`codecs` in the results) shows MSE support for `avc1.640028`, `avc1.42c01e` and `mp4a.40.2` in all three, so no codec filtering skews the results. Only WebKit has native `audioTracks`.
- **Streams:**
  - Quality and ABR: Cloudinary `demo/.../sp_full_hd/sea_turtle.mpd`, with 6 video representations and no audio.
  - Audio: the DASH-IF sample `iis_forest_short_poem_multi_lang_480p_single_adapt_aaclc_sidx.mpd`, with one video and audio in `en` and `de`.
- **Files:**
  - `page.js` is the browser probe: `<video-player>` with `<dash-video>`, the built-in `<media-quality-radio-group>` and `<media-audio-track-radio-group>`, and an own audio bridge.
  - `run.mjs` bundles `page.js` with Rolldown in memory, serves it from `node:http` on port 0 and runs the scenarios. Each scenario gets a fresh browser context, because dash.js caches the last bitrate and track in localStorage.
- **Evidence for a switch:** the engine's current representation or track, `videoHeight` of the decoded frame, dash.js `qualityChangeRendered` / `trackChangeRendered` events, and request counts for the `-de-` audio file. Store state alone was not accepted.
- **Run** from the repo root: `node spikes/s5-dash/run.mjs [chromium] [firefox] [webkit]`. All three take about 3 minutes, and ABR presets run in Chromium only. A run overwrites `results-10.7.0.json`, so run all three engines. Timings change from run to run, because the streams come over the public network.

## Results

| # | Exit criterion | Verdict | Evidence |
| --- | --- | --- | --- |
| 1a | 10.7.0 `<dash-video>` fills `videoRenditionList` | **yes** | 6 renditions in the store 0.76–0.82 s after mount, in all 3 engines. The built-in quality menu renders 7 items (6 plus Auto). The source is `DashMediaTracksMixin` in `@videojs/dash-video/dist/*/media-tracks.js`. |
| 1b | `selectVideoRendition(id)` / `'auto'` work | **yes** | Pin 180p, then 1080p: the engine representation and `videoHeight` match in all 3 engines. `autoSwitchBitrate.video` is `false` while pinned and `true` after `'auto'`. |
| 1c | `<dash-video>` fills `audioTrackList` | **no** | Chromium and Firefox: `[]` and the menu is hidden. WebKit shows **one** native MSE track (`"eng"`), the menu stays hidden (1 item), and that entry still says `eng` after the engine switched to `de`. The mixin mirrors only video. |
| 1d | `selectAudioTrack(id)` switches DASH audio | **no** | The store has nothing to select (in WebKit, only the one native track). |
| 1e | Same on 10.3.0 (the plan pin) | **not verified here** | 10.3.0 is not on disk and installs are not allowed. The 10.3.0 docs checked during planning list no DASH renditions or audio tracks. A run of this script on 10.3.0 needs that version installed. |
| 2a | dash.js `MediaPlayer` reachable | **yes, documented** | `dash-video.md` documents the `engine` property: "An advanced escape hatch for direct engine access". The **element is marked "Unstable API"**. The property comes from the adapter's public `.d.ts`, not from internals. |
| 2b | Own code lists representations | **yes** | `engine.getRepresentationsByType('video')` returns 6 representations (see key numbers). |
| 2c | Own code lists audio tracks | **yes** | `engine.getTracksFor('audio')` returns `en` (index 1) and `de` (index 2). `id` is `null`, and the tracks have no labels or roles. |
| 2d | Own code switches quality (ABR off plus set representation) | **yes, but use the store** | `updateSettings({abr:{autoSwitchBitrate:{video:false}}})` plus `setRepresentationForTypeById('video','3',true)` gives 360p in all 3 engines. The store still thinks Auto, so a later `selectVideoRendition('auto')` is a **no-op and ABR stays off**. |
| 2e | Own code switches audio track | **yes** | `engine.setCurrentTrack(de)`: `trackChangeRendered(de)` after 1.0 s (Chromium), 1.3 s (Firefox) and 0.75 s (WebKit). `-de-` segment requests go from 0 to 9–11. |
| 2f | Own bridge into the built-in store and menu | **yes, documented APIs only** | It uses `store.target.media`, `isMediaAudioTrackCapable`, `addAudioTrack` / `removeAudioTrack` and the writable `enabled` (from the `media-capabilities.md` reference), plus `engine`. It does **not** write `track.id`, which is not documented as writable, so the store keys tracks by list position (`"0"`, `"1"`). Results in all 3 engines: `audioTrackList` has 2 entries, the menu has 2 items, and `selectAudioTrack` reaches the engine (de, then back to en). In WebKit the native `"eng"` entry is replaced, and the list stays at exactly 2 entries after both switches. It also works when attached after the stream started. |
| 2g | ABR presets through `updateSettings({streaming:{abr}})` | **yes** | The documented `source.engine.dashJs`, set at load, gives the expected start and cap for all 5 presets (table below). Mid-play, a new `source.engine.dashJs` was checked only by read-back: `bufferTimeAtTopQuality` read 31, and an active pin was kept. ABR effects of a mid-play preset change were not measured. A direct `engine.updateSettings()` is **lost** on the next `source.engine.dashJs` change: `maxBitrate` was 777, then −1, because the adapter calls `resetSettings()`. |
| 3 | Verdict | **split** | **Video quality: (a)**, the built-in menu works on 10.7.0. **Audio tracks: (b)**, own bridge from the dash.js engine on documented APIs only. **ABR presets: (b)**, through the documented `source.engine.dashJs`, no engine access needed. Two items are **developer decisions**, not blockers: the version bump to 10.7.0 or later, and accepting an "Unstable API" element. |

### Key numbers

- **Cloudinary `sp_full_hd` ladder** (`getRepresentationsByType('video')`, the same in the store):
  - 180p: 104 kbps
  - 270p: 193 kbps
  - 360p: 323 kbps
  - 540p: 553 kbps
  - 720p: 928 kbps
  - 1080p: 2678 kbps

  All rungs are H.264 (`avc1.42c01e` / `4d401f` / `640028`) at 29.97 fps.
- **Time from a store pin to a decoded frame at the new height** (lowest / highest):

  | Engine | Lowest | Highest |
  | --- | --- | --- |
  | Chromium | 2.0 s | 4.0 s |
  | Firefox | 0.5 s | 0.76 s |
  | WebKit | 0.25 s | 0.76 s |

  An earlier Chromium run took 1.3 s / 2.0 s.
- **Audio bridge:**
  - The store list fills 2–3 ms after attach.
  - From `selectAudioTrack` to the rendered engine switch: 0.75–1.5 s.
  - `-de-` requests go from 0 to 8–10.
- **ABR presets** (Chromium, player 640×360 CSS px, DPR 2, measured `clientSize` 640×360, 12 s of play). `fetch widths` is the order of the first 6 video segment fetches (Cloudinary URLs carry `w_<n>`).

| Preset (this spike's mapping) | dash.js `streaming.abr` | first fetch widths | rendered heights in 12 s |
| --- | --- | --- | --- |
| dash.js default | (none) | 1280,1280,1920… | 720 → 1080 (no cap) |
| `fastStart` | `limitBitrateByPortal`, no pixel ratio, `initialBitrate.video: 1` | 320,320,640… | 180 → 360 (start lowest, then portal cap) |
| `balanced` | `limitBitrateByPortal`, no pixel ratio, `initialBitrate.video: 4096` | 640 ×6 | 360 (portal cap 640×360) |
| `highQuality` | `limitBitrateByPortal`, `usePixelRatioInLimitBitrateByPortal`, `initialBitrate.video: 4096` | 1280 ×6 | 720 (portal × DPR 2) |
| cap test | `maxBitrate.video: 600`, `initialBitrate.video: 4096` | 960 ×6 | 540 (553 kbps, under 600) |

### Side observations

- **The store's `activeVideoRendition` is not in step with the picture.** It follows dash.js `qualityChangeRendered`. Against the decoded `videoHeight`, that event came up to about 2 s earlier or later (250 ms polling, so the numbers are rough). In WebKit the event never came for a short 180p pin (about 0.26 s), so the store said `"5"` through that pin. Only a label such as "Auto (720p)" is affected. The cause is not confirmed. This should be reported upstream.
- **Rolldown warns** `COMMONJS_VARIABLE_IN_ESM` inside dash.js 5.2.0 `dist/modern/esm/dash.all.min.js`. Playback is not affected.
- **Do not `import 'dashjs'` in v5 code.** In this repo it resolves to the root dash.js **4.7.4** (a v4 dependency through `videojs-contrib-dash`), not the 5.2.0 that the adapter uses. The probe uses string event names for this reason.

## Code sketch (mechanism for v5)

```js
// Quality: no own code. Use store.selectVideoRendition(id | 'auto'), never engine pins (they desync "Auto").
// ABR preset: source.engine.dashJs REPLACES the dash.js settings, so always send the full preset.
media.source = { src, engine: { dashJs: { streaming: { abr: DASH_PRESETS[strategy] } } } };

// Audio: mirror dash.js tracks into the element's audioTracks list. The built-in store and menu then work.
function bridgeDashAudio(media /* player.store.target.media */) {
  if (!isMediaAudioTrackCapable(media)) return;
  const { engine } = media; // documented escape hatch on <dash-video>
  const infoOf = new Map(); // AudioTrack -> dash.js MediaInfo (track.id is not documented as writable)
  const key = (info) => info && String(info.index); // MediaInfo.id was null in the sample
  const sync = () => {
    for (const t of [...media.audioTracks]) media.removeAudioTrack(t);
    infoOf.clear();
    const current = key(engine.getCurrentTrackFor('audio'));
    for (const info of engine.getTracksFor('audio')) {
      const on = key(info) === current;
      const t = media.addAudioTrack(on ? 'main' : 'alternative', info.labels?.[0]?.text ?? '', info.lang ?? '');
      infoOf.set(t, info);
      t.enabled = on;
    }
  };
  media.audioTracks.addEventListener('change', () => { // store.selectAudioTrack(id) arrives here
    const info = infoOf.get([...media.audioTracks].find((t) => t.enabled));
    if (info && key(info) !== key(engine.getCurrentTrackFor('audio'))) engine.setCurrentTrack(info); // compare state: 'change' is batched
  });
  engine.on('trackChangeRendered', (e) => e.mediaType === 'audio'
    && [...media.audioTracks].forEach((t) => { t.enabled = key(infoOf.get(t)) === key(e.newMediaInfo); }));
  engine.on('streamInitialized', sync);
  if (engine.getTracksFor('audio').length) sync(); // the stream may start before the bridge
} // Production code also needs engine.off / removeEventListener on source change and destroy.
```

## Device / floor checklist (a human must still check)

- **iPhone Safari:** DASH needs MSE or ManagedMediaSource (iOS 17.1 and later). On older iPhones `<dash-video>` cannot play, so v5 must serve HLS there. Not verified here (it needs a real device).
- **Real Safari on macOS and iOS:** check that the native MSE audio track (`"eng"`) does not come back next to the bridged tracks after a seek or a period change. Headless WebKit stayed at 2 entries through two switches.
- **Browser floor:** the plan's floor versions (for example the older Safari and Chrome versions in the support matrix) were not tested here. An older engine is not installed.
- **Real networks and devices:**
  - Use throttled or mobile networks to see the climb and abandon behaviour.
  - Check the portal cap at real DPR values (2.6 or 3 on Android).
  - Check pin-to-picture time on low-end devices.
- **Streams not covered:**
  - Multi-period and live DASH (the bridge must re-sync per period).
  - Cloudinary-made multi-audio DASH manifests (a public sample was used).
  - DASH with `<Label>` and `Role` elements.
- **Accessibility:** the sample has no labels, so the audio menu shows `en` / `de`. Check the screen-reader output and a language-name formatter (`formatTrack`).

## Open questions for the developer

1. **Version pin.** DASH renditions in the store work on 10.7.0. The plan pins 10.3.0, where the docs list none (not re-verified here). Bump the pin to the version that added `DashMediaTracksMixin` or later?
2. **Unstable API.** `<dash-video>` and its `engine` are documented but marked "Unstable API", which can change in a minor release. Accept this with an exact pin and a changelog check on upgrade? The bridge uses no internal Video.js APIs, but it couples to the dash.js 5 API.
3. **ABR presets for DASH** are new behaviour, because v4 applied `strategy` to hls.js only. Adopt the mapping above, keep presets HLS-only, or expose `source.engine.dashJs` directly? v4 keys with no clear dash.js match: `maxDevicePixelRatio`, `enableWorker`, HDR `videoPreference`, and the iOS `capLevelOnFPSDrop` (dash.js has `droppedFramesRule`).
4. **Upstream.** Propose DASH audio tracks in `DashMediaTracksMixin` (the bridge then becomes deletable) and report the out-of-step `activeVideoRendition`?
5. **v4 parity gap.** v4 pins an audio quality in proportion to a video pin (`audioMapper`). The 10.7.0 built-in pin leaves audio ABR on. Keep this as accepted?
6. **dash.js caching.** dash.js stores the last bitrate and track in localStorage (`lastBitrateCachingInfo`, `lastMediaSettingsCachingInfo`). This spike used fresh contexts, so the effect on presets for returning viewers was not measured. Turn the caching off for predictable presets?
7. **Dependency hygiene.** Never import `dashjs` from v5 source while the v4 `dashjs` 4.7.4 is in the tree. Alternatively, add dash.js 5.x as a direct dependency that matches `@videojs/dash-video`.
