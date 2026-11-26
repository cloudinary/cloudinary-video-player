# S-7 · Media element and overlay

**Question.** Can the integrator's own `<video id="…">` (v4 style: `cloudinary.videoPlayer('id', options)`) be Video.js 10's media element on every engine, as the plain native media and as the light-DOM `<video slot="media">` of `<hlsjs-video>`, and stay the same node through engine switches? Can a small own overlay layer drive an "upcoming video" overlay and an end screen? Does the Video.js 10 time slider seek while the user drags on touch (decides v4's `disableSeekWhileScrubbingOnMobile`)?

## Method

- Versions: `@videojs/html`, `@videojs/hlsjs-video` **10.7.0** (the plan pins 10.3.0; not run on 10.3.0), hls.js 1.7.4, `@playwright/test` 1.60.
- Engines (headless): Playwright Chromium 148 (it plays H.264/AAC, so no branded Chrome was needed), Playwright WebKit 26.4 (macOS 14), Playwright Firefox 150 (extra).
- Media: `https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4` (15.22 s) and `…/sp_auto/sea_turtle.m3u8`.
- `fixture/index.html` is an integrator page with a bare `<video id="my-video" class="cld-video-player cld-fluid my-class" data-cld-public-id data-test muted playsinline crossorigin preload>`. `fixture/page.js` is the mechanism under test: it wraps that node at run time in `<video-player><video-skin>` (Default skin), switches engines, defines the `<cld-overlay-layer>` element (`UIElement` + `PlayerController`, as in the docs' "Build your own component"), and a small own `<media-container>` + `<media-time-slider>` for the touch test.
- `run.mjs` bundles `page.js` in memory with Rolldown, serves it from `node:http` on port 0, runs the checks and writes `results.json`. Playback is always started by a real click on the skin's play button. Touch drags use Chromium CDP `Input.dispatchTouchEvent` in a `hasTouch` / `isMobile` context (390×844), 8 moves 150 ms apart (above the 100 ms throttle).
- Run from the repository root: `node spikes/s7-media/run.mjs` (all engines, about 4 minutes) or `node spikes/s7-media/run.mjs chromium`.

## Results

| # | Exit criterion | Verdict | Evidence (`results.json`) |
|---|---|---|---|
| 1 | The integrator's `<video>` is the media element for native MP4 and for `<hlsjs-video>` (`slot="media"`), and plays | **yes** (Chromium, WebKit; Firefox too) | Native: `player.store.target.media === video`. hls.js: `store.target.media` is the **`<hlsjs-video>` wrapper**, and `wrapper.engine.media === video` (hls.js attaches MSE to our node; `currentSrc` is a `blob:` URL). `document.getElementById('my-video')` is the same node in every leg. UI click plays it, time advances, store `paused`/`currentTime` follow. WebKit: Video.js uses **hls.js over MSE by default** (`engineName: 'hlsjs'`), native HLS only with `preferPlayback: 'native'` (also plays, `engineName: 'browser'`; Chromium 148 plays that path too, its `canPlayType` for HLS is "maybe"). In WebKit, leg 1 reports `ready: false` (with `preload="metadata"` WebKit stays at `readyState` 1 until play); the click then played it and time advanced. |
| 2 | The same node survives MP4 → HLS → MP4; UI still drives playback; no duplicate `<video>` left | **yes** (all three engines) | Same node in every leg. Attributes diffed against the original markup after **each** leg: only `src` changes (MP4 URL, or hls.js's `blob:` URL), plus `slot="media"` while inside the wrapper; `id`, classes, `data-*`, `muted`, `playsinline`, `crossorigin`, `preload` never change (no `disableremoteplayback` either, also not in WebKit). During HLS there are 2 `<video>` in the document: ours and the wrapper's inert shadow fallback (`src` null, `currentSrc` empty). After the return there is 1; the old wrapper is disconnected and its `engine` is `null`. The skin's play button works after each switch. |
| 3 | Own overlay layer (child of the skin, above media, inside the fullscreen container) drives an upcoming overlay N s before the end and an end screen on `ended` | **yes** (Chromium; WebKit and Firefox same results) | `beforeEnd: 5` showed at t = 10.22–10.24 of 15.22 s, hid after seeking back, and hid on `ended`; the end screen showed on `ended`. The layer is slotted into `<media-container>`, covers it, `z-index: 25`. Hit tests: the overlay is on top of the media; the skin's control bar (z-index 30) stays on top of the overlay. Fullscreen through the skin's button: the fullscreen element is `video-skin` (shadow: `media-container`), the end screen fills the screen (800×600 in Chromium and WebKit, 1366×768 in Firefox) and is on top. Strings render as text. |
| 4 | Does the time slider seek continuously while dragging on touch? | **yes, it seeks while dragging** (Chromium touch; WebKit **not verified here**: Playwright has no touch drag for WebKit, needs a real iPhone) | Source: `createSlider` (`@videojs/core/dist/*/dom/ui/slider/slider.js`) calls a leading+trailing throttled `onValueChange` on every `pointermove` of any pointer type (only the `buttons === 0` check skips touch); `media-time-slider` seeks in `onValueChange` while dragging (`@videojs/html/dist/*/ui/time-slider/element.js`). Measured: 8 `seeking` events during an 8-move drag, 0 after release, 3 new media requests during the drag. |

## Key numbers

- Slotted video size: in `<hlsjs-video>` our `<video>` renders at its intrinsic **1280×720 inside a 640×360 container** (clipped). The skin's `::slotted(video)` rule matches only direct children of the skin, and the wrapper's shadow `video {}` rule does not reach slotted nodes. One own rule fixes it (640×360): `video-skin > hlsjs-video > video[slot="media"] { display:block; width:100%; height:100%; object-fit:contain }`.
- Touch drag, default `change-throttle` (100 ms): 8 seeks / 8 moves, currentTime follows the finger (3.1 → 13.7 s). With `change-throttle="600000"` in the markup: 1 seek at drag start (leading call) + 1 at release, 0 media requests during the drag.
- `HLS → MP4` with `src` set right after the move (no wait for the wrapper's destroy microtask) also works in all three engines: hls.js `detachMedia` clears `src` only while it is still its `blob:` URL.
- `<hlsjs-video>` with an `.mp4` source plays through the browser (`engineName: 'browser'`) on all three engines, so the wrapper can stay once loaded.
- Container tap gesture: a click on an overlay **button** does not toggle playback (buttons count as interactive). A click on the **background** of the end screen toggles playback (skin `media-gesture type="tap" action="togglePaused" pointer="mouse"`) and restarts the ended video. `stopPropagation()` of `pointerdown`/`pointerup` on the overlay stops it (verified).
- Firefox with `preferPlayback: 'native'`: no native HLS, Video.js does not fall back to hls.js (the adapter decides `useMse = Hls.isSupported() && isHls && preferPlayback !== 'native'`), so it does not play. The docs say it falls back.

## Code sketch (mechanism for v5)

```js
// Adopt the integrator's <video>: wrap it in place.
const video = document.getElementById(id);
const player = document.createElement('video-player'); // our createPlayer() element in v5
const skin = document.createElement('video-skin');     // our ejected skin in v5
video.replaceWith(player);
skin.append(video, overlayLayer);                      // overlay layer: light-DOM child, z-index 25
player.append(skin);
video.src = mp4Url;                                    // native: store.target.media === video

// Native -> hls.js (lazy chunk): the engine element is new, the <video> node is moved, never cloned.
const hls = document.createElement('hlsjs-video');
video.replaceWith(hls);
video.slot = 'media';
hls.append(video);
await new Promise((r) => setTimeout(r));               // slotchange: adapter attaches to our <video>
hls.source = { src: m3u8Url };                         // store.target.media === hls; hls.engine.media === video

// hls.js -> native: put the <video> back, drop the wrapper (its destroy runs hls.js detachMedia).
hls.replaceWith(video);
video.removeAttribute('slot');
video.src = mp4Url;

// Overlay: UIElement + PlayerController(this, playerContext, selectTime / selectPlayback);
// in update(): show "beforeEnd" when duration - currentTime <= N && !ended, show "ended" when ended.
// Full overlays: stopPropagation() on pointerdown/pointerup so the container tap gesture does not toggle playback.
```

## Device / floor checklist (human, real devices)

- iPhone Safari 17.1+: `Hls.isSupported()` is true there (ManagedMediaSource), so `<hlsjs-video>` picks hls.js, not native HLS. Check playback, AirPlay and native fullscreen with our slotted `<video>`, and that `playsinline` keeps working.
- iPhone below 17.1 (no MSE): the wrapper's native path with our slotted `<video>`.
- iPhone native video fullscreen: overlays are not shown there (expected); check that they are correct after exit.
- Real touch scrub on iPhone and Android: Video.js 10 seeks up to 10 times a second while dragging. Check jank and data use on cellular.
- WebKit touch drag in general: not verified here.
- Older browsers floor and the 10.3.0 pin: this run used 10.7.0 only.
- Repeated switches over a long playlist: check for leaked hls.js instances or MediaSource objects.
- Compact and touch layouts: the skin's center controls group (play, ±10 s) has `z-index: 30`, above the layer (25). The hit tests ran at 800×600 with a mouse; check whether the center buttons sit over a full overlay on a phone.
- Screen reader and keyboard on the overlays: roles are set, but focus move and return are not built in this spike.

## Open questions for the developer

1. **What is `FeatureContext.media`?** The store's media is our `<video>` on native and the `<hlsjs-video>` wrapper on hls.js. Expose the wrapper for actions and state, and our `<video>` for DOM events and attributes? (R-03 says "`media` (the media element)".)
2. **`slot="media"` is not documented for `<hlsjs-video>`.** It works through `CustomMediaElement`'s `target` getter (`:scope > [slot=media]`), which is in the source only; R-02 lists it as a fact. Accept it with a pinning test, or ask upstream to document it?
3. **Keep the wrapper once hls.js is loaded?** It plays MP4 through the browser, so the next MP4 needs no unwrap. Or always unwrap to keep the plain-video path?
4. **`disableSeekWhileScrubbingOnMobile` (contracts/options.md: keep the v4 behavior).** Video.js 10 seeks while dragging. Options: (a) accept the Video.js 10 behavior; (b) set `change-throttle` very high in the ejected skin only on touch devices (for example `(pointer: coarse)` at render, because the value is read at connect): 2 seeks (start and release), documented attribute; (c) own slider logic for release-only seeks.
5. **Gesture blocking for full overlays:** `stopPropagation()` in the overlay (verified), or Video.js's internal `[data-interactive]` selector (not documented)?
6. **`preferPlayback` on iOS:** Video.js prefers hls.js wherever MSE or ManagedMediaSource exists. Should v5 set `preferPlayback: 'native'` on iPhone? Note that `'native'` does not fall back where the browser has no HLS (Firefox), contrary to the docs.
7. The slotted `<video>` needs one own CSS rule for its size (above). Put it in the v5 skin CSS?
