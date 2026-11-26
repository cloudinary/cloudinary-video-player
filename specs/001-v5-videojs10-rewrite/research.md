# Research: Cloudinary Video Player v5

Phase 0 output for `plan.md`. Each item: **Decision**, **Rationale**, **Alternatives considered**, and **Evidence** — either *verified* (with source) or *needs spike* (a Phase 0 proof before the design is fixed; listed in the plan's phase 0). Research date: 2026-11-11.

| ID | Topic | Status |
|---|---|---|
| R-01 | Build, size, schema and lint tools | Decided; spikes for tsdown IIFE/CSS, schema generator, lint rules |
| R-02 | Video.js 10 public extension points + mechanism matrix | Decided; spikes S-1, S-3, S-4, S-5 |
| R-03 | Event bridge and internal feature communication | Decided |
| R-04 | Ads on the IMA SDK without contrib-ads | Decided; spike for iPhone and `adsInPlaylist` parity |
| R-05 | Skin: eject, v4 look, other v10 skins | Decided (other v10 skins → 5.x); spike S-2 |
| R-06 | Generic overlay | Decided; spike for the API shape |
| R-07 | Own URL builder and URL parity | Decided |
| R-08 | Test strategy and CI | Decided (2026-11-23), `test-plan.md` |
| R-09 | CDN loader and chunk loading | Decided; spike for cross-origin loading |
| R-10 | Custom element | Decided |
| R-11 | Getter/setter methods | Decided (2026-11-12, from the FR-004 confirmation) |
| R-12 | Size budgets | Decided (plan) |
| R-13 | Host-product owners | Open (not blocking) |

## Phase 0 spikes

Each spike ends with a yes/no and a short code sketch, recorded in `log.md`. A "no" goes back to the developer before `tasks.md` is final.

| ID | Question | Exit criterion | From |
|---|---|---|---|
| S-1 | Can the default player fit the SC-007 budget? Measured like for like with the size budget entry: shell + core + layer (`src/player/`) + Video.js 10 tree-shaken to `videoFeatures` + ejected skin script **and** default CSS + English i18n; no streaming engine, no ads, no optional features. | Measured ≤ 60 KB gzip → go; 60–70 KB → go with a plan note; > 70 KB → stop and ask (spec SC-007 caps at half of v4, about 70 KB). Own code not yet written (core, layer) is stood in for by a size allowance of 15 KB, stated in the result. | R-02 (CDN bundle measured ≈ 92 KB) |
| S-2 | Which skin to eject, and does its CSS meet the browser floor? | Compat or flattened Default runs on Safari 16.4; one own control and one overlay work. | R-05 |
| S-3 | Own caption renderer with word highlight, plus native captions in iPhone fullscreen | Styled + word-highlighted cues inline; captions visible in iPhone native fullscreen. | R-02 |
| S-4 | IMA inside the player | IMA's `<video>` is not picked as the main media; pre-roll → content on iPhone; v4 behavior of `adsInPlaylist` and `postrollTimeout` recorded. | R-02, R-04 |
| S-5 | DASH quality/audio menus and ABR presets | Rendition and audio lists from the dash.js engine, or a decision to drop DASH menus (FR-014 says "where the stream provides them"). | R-02 |
| S-6 | Build and CDN loading | tsdown IIFE keeps native `import()`; per-chunk CSS names predictable; cross-origin load from jsDelivr with CORS; loader ≤ 10 KB; schema generator reads TS 7 types; oxlint ring rules work. | R-01, R-09 |
| S-7 | Media element and overlay | The integrator's `<video>` becomes the media element for native and hls.js (`slot="media"`), survives an engine switch; overlay API drives the upcoming overlay and the end screen; record whether Video.js 10 seeks while dragging on touch (decides the `disableSeekWhileScrubbingOnMobile` behavior). | R-02, R-06, R-10 |

---

## R-01 · Build, size, schema and lint tools

Versions verified on npm on 2026-11-11: Vite 8.3.8, tsdown 0.23.7, Rolldown 1.3.2, Rollup 4.68.2, TypeScript 7.0.2, Vitest 5.1.0, Playwright 1.65.0, @axe-core/playwright 4.14.0, size-limit 14.3.0, ts-json-schema-generator 2.9.0, oxlint 1.93.0, ESLint 10.14.0, typescript-eslint 8.72.2, Biome 2.6.6.

**Decision.**

| Need | Tool | Notes |
|---|---|---|
| Language | TypeScript 7, `strict`, `isolatedDeclarations: true` | Fast `.d.ts` without the TS API. |
| Library build | **tsdown**, exact version pinned | One config returns two builds: ESM (entry + chunks, `css.splitting` = one CSS file per chunk, oxc `.d.ts`) and IIFE (the CDN loader). |
| Demo/dev server | Vite 8 | Dev only; not used for the library output. |
| Size budgets | **size-limit** with `gzip: true` | Glob checks for entry totals plus one generated check per chunk. |
| `schema.json` | **ts-json-schema-generator** 2.9 | JSDoc `@default`/`@examples`/`@deprecated` read; literal unions → `enum`; `functions: "hide"`. CI fails on `git diff --exit-code schema.json` (committed at the repository root; `dist/` is git-ignored) drift. |
| Lint | **oxlint `--type-aware`** + `tsc --noEmit` | Only typed linter that runs on TS 7 today; ring rules through `no-restricted-imports`. |

**Rationale.** D-23 asks for one tool. Vite 8 library mode cannot build an IIFE with several entries, does not split CSS per lazy chunk with a loader for it, and emits no `.d.ts`; its own docs point to tsdown/Rolldown for advanced library builds. tsdown does both builds in one run. size-limit covers totals and per-chunk budgets offline. typescript-json-schema is in maintenance mode and points to ts-json-schema-generator. typescript-eslint needs TS < 6.1 (TS 7 ships no API).

**Alternatives.** Vite 8 library mode (two configs, own CSS loader, separate `.d.ts` step). Plain Rollup 4 (mature, but a plugin per concern and slower). bundlewatch (already used in v4; per-file gzip with base-branch comparison) — the fallback if size-limit is unsuitable. Biome 2 (lint + format, weaker type-aware rules). typescript-eslint on a pinned TS 6 next to TS 7 — the lint fallback.

**Spikes (Phase 0).**
1. tsdown 0.x risk: confirm the IIFE output keeps a native `import()` with a computed URL, and that `css.splitting` (experimental) gives predictable per-chunk CSS names. Fallback: Rolldown directly with the same config.
2. ts-json-schema-generator ships its own TypeScript 5.9; confirm it reads our TS 7 project types with a separate tsconfig.
3. oxlint `no-restricted-imports` covers the ring rules (patterns by folder).

## R-02 · Video.js 10 public extension points and mechanism matrix

**Facts** (verified against `@videojs/*@10.3.0` docs and package files on unpkg, 2026-11-11; `[nv]` = not verified):

- Latest is **10.3.0** (2026-11-04); `@videojs/hlsjs-video@10.3.0` pins **hls.js 1.7.3**. Code lives in `videojs/video.js` (`packages/*`).
- Player: `<video-player><video-skin><video | hlsjs-video | dash-video>`; `createPlayer({ features })` → `{ PlayerElement, PlayerController, playerContext }`; we call `customElements.define`. Feature bundles: `videoFeatures`, `liveVideoFeatures`, `audioFeatures`, … Store: `player.store`; media: `player.store.target.media`; `target` is `null` until media attaches and actions throw before that (our queue covers it).
- Source switch: set `src`/`source` (`{ src, type, preferPlayback, engine }`) on the media element (fires `sourcechange`). A different engine = replace the media element; the UI follows. `<hlsjs-video>` accepts a light-DOM `<video slot="media">`, so the integrator's own `<video>` can be the media element on every engine.
- Store state/actions (documented): `paused, ended, started, waiting, play(), pause(), currentTime, duration, seeking, seek(), volume, muted, setVolume(), setMuted(), isFullscreen, requestFullscreen(), isPictureInPicture, error, dismissError(), textTrackList, subtitlesShowing, chaptersCues, thumbnailsTrack, toggleSubtitles(), selectSubtitlesTrack(), videoRenditionList, selectVideoRendition(), audioTrackList, selectAudioTrack(), userActive, controlsVisible, requestControlsLock()`. `store.subscribe(cb)` (batched per microtask). DOM media events still fire on the media element.
- Custom UI: `UIElement` (light DOM) + `PlayerController(this, selector)` — documented. Overlays: children of `<video-skin>` are slotted into `<media-container>` (fullscreen and activity apply); they need a `z-index`.
- Skins: Default, Neutral, Compat, Scaffold. Packaged skins use an open shadow DOM and **cannot take new control-bar buttons**; adding controls requires ejecting (Shadcn registry → `skin.html`, `skin.ts`, `skin.css`, theme CSS). Ejected plain-CSS skins use `@scope`, which needs Safari 17.4 / Chrome 118 / Firefox 146 unless the CSS is flattened.
- Captions: rendered by the browser (`::cue`), no custom renderer, no appearance menu, no custom cue markup; the caption controls use only `showing`/`disabled`. Tracks can be added with `<track>` or `media.addTextTrack()`.
- Chapters: `<track kind="chapters">` → `chaptersCues`, `<media-time-slider-chapters>`; no chapter menu, no active-chapter state, no cue points. Thumbnails: `<track kind="metadata" label="thumbnails">` with image URL `#xywh` cues; images need CORS.
- Errors: `<media-error-dialog>`; known codes map to i18n keys (`registerI18n`); no public way to raise an app-defined error.
- Adapters: tag selects adapter; `resolveAdapterType(src, type)`; late attach and dynamic import supported. `<dash-video>` (dash.js 5.2) is "Unstable API" and lists **no renditions or audio tracks**. Quality and audio menus work only on hls.js over MSE.
- Mobile: fixed 2 s idle; built-in tap and double-tap gestures; `<media-hotkey>`; fullscreen on `<media-container>`; iPhone uses native video fullscreen (no full-window fallback). i18n: `registerI18n`, 50+ locale packs on demand.
- Internal (not used by us): `definePlayerFeature`, `PlayerExtension`, `defineSlice`, `extensionContext`, `mediaContext`, `createMediaAttachMixin` — re-exported from the `@videojs/html` root but `@internal`. A lint rule bans these names.
- Roadmap: ads planned for "late 2026" (issue #9438, no milestone); no playlists; "no plugin system, by design".
- Size: published beta figure 25.1 KB gzip (method not stated). Measured from `@videojs/cdn@10.3.0` (static import graph, gzip -9): **player + default skin + CSS + i18n ≈ 92 KB**; with hls.js ≈ 286 KB. Tree-shaken size with an ejected skin is unknown → spike S-1.

**Decision.** Build on documented APIs only: the media element and its events, the store state/actions above, `UIElement` + `PlayerController` for our controls, an ejected skin we own, `<track>` elements for chapters and thumbnails, and the adapter elements. Our own state (source, playlist, ads, Cloudinary errors) stays outside the store (R-03). **Internal API exceptions: none planned.**

### Mechanism matrix (5.0 feature list)

| Feature | Mechanism | Detail |
|---|---|---|
| Adaptive streaming (HLS) + quality + audio menus | Public | `<hlsjs-video>` (lazy chunk), `<media-quality-radio-group>`, `<media-audio-track-radio-group>`, `selectVideoRendition()` |
| Adaptive streaming (DASH) | Public + **Spike S-5** | `<dash-video>` plays; quality/audio menus missing in v10 → own lists from the dash.js engine if it is exposed, else a decision for the developer |
| ABR presets, HDR preference | Public + Spike S-5 | `source.engine.hlsJs` config passthrough; dash equivalent in S-5 |
| AES-128 HLS, TS live | Public | hls.js (D-18) |
| Seek thumbnails | Public | metadata track `label="thumbnails"`, `<media-slider-thumbnail>` |
| Chapters on the seek bar | Public | chapters `<track>`, `<media-time-slider-chapters>` |
| Chapters menu (`chaptersButton`) | Own on public | `UIElement` reading `chaptersCues` |
| AI highlights graph | Own on public | `UIElement` in the ejected time slider |
| Captions: VTT, SRT, transcripts | Own on public | Core converts SRT/transcripts to cues → `media.addTextTrack()` |
| Caption styles + word highlight | **Own + Spike S-3** | Own renderer: tracks in `hidden` mode, own captions menu (built-in sets `showing`); switch to native `showing` in iPhone native fullscreen (US4-1) |
| Title and description | Own on public | `UIElement` (plain text) |
| ±10 s jump, PiP, fullscreen, keyboard | Public | Skin seek buttons, PiP button, `requestFullscreen()`, `<media-hotkey>` |
| Logo, download, source switcher, playlist next/prev | Own on public | `UIElement`s in the ejected skin |
| Colors, dark/light, custom font | Own on public | Ejected skin CSS (ours) + the 8 `--media-*` variables; runtime dark/light by class |
| Big play button only at start | Own on public | CSS on the `started` state |
| Mobile big pause button | Public | v10 gestures and mobile controls (D-01 "Replace") |
| Playlist, by tag, widget | Own | Core state + feature DOM |
| Upcoming overlay, recommendations, generic overlay | Own on public | Child of `<video-skin>` slotted into `<media-container>` (R-06) |
| Ads (IMA) | **Own + Spike S-4** | Outside overlay calling `play()`/`pause()`/`requestControlsLock()`; risk: the IMA `<video>` could be picked as the main media `[nv]` |
| Cloudinary error messages, live retry | Own on public | Own error `UIElement` reading `error` + core error state; replaces `<media-error-dialog>` in our skin; generic texts via `registerI18n` |
| Floating player, autoplay on scroll, context menu | Own | `IntersectionObserver`, DOM, `play()` |
| GA, Cloudinary analytics, usage report, played events | Own | Media events (event bridge) |
| Lazy, schedule, profiles, debug | Own | Shell and core |
| i18n of control labels | Public | `registerI18n` |

## R-03 · Event bridge and internal feature communication

**Decision.** One `event-bridge.ts` in the layer turns media-element events and Video.js 10 state changes into the public events (`contracts/events.md`) and dispatches them on the shell's `EventTarget`, so listeners attached before ready keep working. Features do not talk through public events. Each feature gets a `FeatureContext` with: `media` (the media element), `root` (container), `store` access through `player/context.ts`, `source$` (current `Source`, with a change callback), `signal` (aborted on source change), `emit(publicEvent)`, `onDispose`. Cross-feature needs go through the context (for example `setControlsVisible`, `setAdActive`), not through each other.

**Rationale.** v4 had ~30 string events, two source events, a Node `EventEmitter` on top of Video.js events and state hung on the player (audit G). One bridge and one context make dependencies explicit and testable; the ad gate (R-04) lives in one place.

**Alternatives.** A global event bus (rejected: same implicit coupling as v4). Using Video.js 10 store slices for our state (rejected for core state: requires internal `definePlayerFeature`; see R-02).

**Evidence.** Verified from v4 source (`src/extended-events.js`, `src/utils/consts.js`) and audit G.

## R-04 · Ads on the IMA SDK without contrib-ads

**Decision.** One lazy `features/ads` module (own code ≤ 15 KB) that loads `//imasdk.googleapis.com/js/sdkloader/ima3.js` itself (with `onerror` and a timeout; any failure = "no ads, play content", FR-020). It owns one `AdDisplayContainer` and one `AdsLoader`, and talks to the player only through the `FeatureContext` plus three ad hooks:

- `onPlayRequest(hook)` — called **synchronously** in the play button/key handler, so `adDisplayContainer.initialize()` runs inside the user gesture; the hook can hold content until it releases it (replaces the contrib-ads play middleware);
- `setAdActive(bool)` — the event bridge suppresses content `play`/`pause`/`ended`/`timeupdate` while an ad plays (replaces contrib-ads redispatch);
- `holdEnded(promise)` — delays the public `ended` and playlist auto-advance until post-rolls finish or time out.

States: `idle → waiting (preroll timeout) → ad → content → postroll-wait (postroll timeout) → done`. Resume handling is idempotent (the Firefox IMA shim fires resume without pause). Mid-rolls come from VMAP/ad rules. One `ResizeObserver` on the root calls `adsManager.resize()` (fluid and fullscreen). On iPhone, branch on `adsManager.isCustomPlaybackUsed()` with `restoreCustomPlaybackStateOnAdBreakComplete`, plus a snapshot fallback (source, time, track modes).

**Settings map.** `locale` → `ima.settings.setLocale` (global, before any IMA object); `adTagUrl` → `AdsRequest.adTagUrl`; `showCountdown` → `uiElements` (`AD_ATTRIBUTION`, `COUNTDOWN`; ignored by IMA for AdSense/AdX); `adLabel` → own small label (IMA text cannot be changed); `prerollTimeout`, `postrollTimeout` → our state timers; `adsInPlaylist` → per item: `adsManager.destroy()` → `adsLoader.contentComplete()` → `requestAds()` (`every-video`), or once (`first-video`).

**Rationale.** Video.js 10 has no ads support and no date for it; `videojs-ima` and `videojs-contrib-ads` require Video.js 8. The narrow interface keeps ads out of the core and testable with a fake `google.ima`.

**Alternatives.** Port contrib-ads (rejected: Video.js 8 middleware and tech model). Google DAI/SSAI (rejected: beyond v4 parity, D-13).

**Spikes (Phase 0).**
1. **v4 parity of `adsInPlaylist`**: in v4, `adsInPlaylist` calls `ima.playAdBreak()` on source change, which does nothing while `autoPlayAdBreaks` is on (the v4 default). Run the v4 demo in a browser and record what really happens before defining parity.
2. **v4 parity of `postrollTimeout`**: v4 does not pass it to contrib-ads, so the real wait is 5 s. Decide whether v5 honors the option (fix) or keeps 5 s.
3. **iPhone single-element playback** with `disableCustomPlaybackForIOS10Plus` default vs `true` (skippable ads need `true`; then ads play inline only).

**Evidence.** Verified: IMA HTML5 docs (client-side guide, autoplay, ad rules, FAQ, skippable ads, `ImaSdkSettings`, `AdsManager`, `AdsRenderingSettings`, localization, release history — latest SDK 3.797.1, 2026-10-30), `videojs-ima` 2.5.0 and `videojs-contrib-ads` 7.5.2 source in `node_modules`, `src/plugins/ima/index.js`. VPAID: still supported in secure mode, SIMID preferred since 3.612.0; no end date found.

## R-05 · Skin: eject, v4 look, other v10 skins

**Decision.**
1. Eject one Video.js 10 video skin once (pinned to the version in `plan.md`; 10.7.0 since 2026-11-26) into `src/skins/v4/` and own it: `skin.html` (our template with our controls added), `skin.ts`, `skin.css` restyled to the v4 look with `.cld-video-player-skin-dark` / `-light` classes, the `--color-base/accent/text` variables mapped onto the eight `--media-*` variables, SVG icons (D-20), Inter (FR-041). Start from the **Compat** skin if its CSS already meets our browser floor (Safari 16.4 / Chrome 111 / Firefox 121); otherwise eject Default and **flatten `@scope`** into class-scoped selectors. Light DOM (no shadow root) so customer CSS and v4 classes apply.
2. **Other v10 skins (Neutral, Compat, Scaffold) through the `skin` option: not in 5.0; move to 5.x** (FR-040 lets the plan decide). Packaged skins live in a shadow DOM and cannot take new controls, so logo, download, source switcher, playlist buttons, the chapters menu and our caption renderer would silently disappear with them; ejecting and maintaining three more skins is not "cheap".
3. Upgrade routine: on each Video.js minor, re-eject into a scratch folder and diff against ours (one task per minor).

**Rationale.** D-19 (v4 look by default; other skins only if cheap); the spec floor (Safari 16.4) vs `@scope`; packaged skins are closed to new buttons.

**Alternatives.** Use a packaged skin and inject controls (rejected: not supported; shadow DOM). Build a skin from scratch without ejecting (rejected: re-does accessible controls that Video.js already ships). Offer packaged skins with a reduced feature set (rejected: silent feature loss, support burden).

**Spike S-2.** Eject Compat and Default; check the CSS against the floor; add one own control and one overlay; measure the skin's size.

## R-06 · Generic overlay

**Decision.** `features/overlay` implements `player.addOverlay(spec)` (`contracts/public-api.md` §5): a layer element inside the player root, above the video and below the control bar; `trigger` driven by `timeupdate`/`ended` from the context; `placement` by CSS classes; strings as text; focus management for `full` overlays; all overlays removed on source change and dispose. The upcoming-video overlay (`playlist`) and the recommendations end screen (`recommendations`) are thin users of it.

**Rationale.** FR-039 and FR-021; replaces two v4 components that duplicated modal logic (`recommendations-overlay` had a TODO to use ModalDialog, misspelled aria labels; audit G).

**Alternatives.** Video.js 10 dialogs (rejected unless R-02 finds a public, styleable dialog API — then the overlay uses it underneath with no API change).

**Spike.** Build the upcoming overlay and the end screen on the draft API; confirm the API is enough without new options.

## R-07 · Own URL builder and URL parity

**Decision.** `src/core/url/transformation.ts` serializes v4/SDK transformation objects to the URL string, covering every key the url-gen `backwards` serializer handles: `a, ar, b, bo, c, co, dpr, e, fl, fn, fps, h, ki, l, o, q, r, t, u, w, x, y, z, ac, af, br, cs, d, dl, dn, du, eo, f, g, pg, p, so, sp, vc, vs`, user variables (`$name`), conditions (`if`), chained arrays, raw strings, and the `offset`/range helpers. Media-URL assembly (`media-url.ts`) reproduces v4 prefixes, versions, `_s=vp` and query parameters. Signed URLs are out (FR-029).

**Parity method.** Before any v5 code: a script runs v4's `VideoSource`/`ImageSource` URL generation over the 64 existing `videoSource` test inputs plus inputs from every demo page and the v4 config samples, and saves `{ input, urls }` as JSON fixtures (`test/fixtures/url-parity/`). v5 must match each fixture byte for byte, or the case is listed in `intentional-changes.json` with a reason (SC-002). Fixtures are recorded from v4 code, never typed by hand.

**Rationale.** `@cloudinary/url-gen` is used only through its legacy shims, with signing commented out (audit E, H); the serializer is ≈ 200 lines plus ≈ 800 lines of helpers, most of them for image features we do not use. An own builder with recorded fixtures is smaller and proves parity.

**Alternatives.** Keep url-gen legacy (rejected: size, unused modern builder, dead signing path). Use the modern url-gen builder (rejected: different input shape, would break v4 options).

**Evidence.** Verified: `node_modules/@cloudinary/url-gen/backwards/generateTransformationString.js` (key list above), audit E/I (64 cases).

## R-08 · Test strategy and CI (D-25)

**Status (2026-11-23).** The full test plan is [`test-plan.md`](test-plan.md); it replaces the earlier draft of this section. All its questions are decided (its §10). In short:

- Compact: static checks (types, lint, schema drift, size, publint + attw), unit (Node, core), browser (Vitest browser mode), end-to-end (Playwright, with axe and keyboard), preview smoke; TTFF and WebView checks on own devices per RC. No coverage gates: each test protects a user-visible behavior, a spec criterion or a fixed bug.
- End-to-end runs against the built artifact served locally, with live Cloudinary `demo` assets, on branded Chrome for PRs (H.264/AAC, as v4). One `examples/player.html` renders typed presets from `examples/presets/` in three delivery modes (CDN script, npm, element); tests open direct URLs and use no fixed waits.
- Netlify builds the deploy preview on the current site as in v4; a smoke test runs on it once it serves the PR's commit. Reports are pushed to the reports repository as in v4.
- CI: four PR jobs (checks, browser, e2e, preview), cancel on new push; PR target ≤ 10 min; three engines nightly; a flaky test is fixed, or skipped with a ticket.

**Rationale.** v4 tests mostly check that a video plays, run twice (ESM and non-ESM) on copied pages, test the dev server instead of `dist/`, wait on fixed timers and on the preview, and run on Chrome only (`test-plan.md` §1). jsdom has no media playback or layout, so player-level tests belong in a real browser.

**Removed.** The 16 dead jest/puppeteer files (audit I); their 19 validator cases are ported to unit tests. The v4 Playwright specs are replaced, not ported.

**Alternatives.** Local media fixtures with a nightly live suite, CI-built preview uploads, artifact-only reports, a second Netlify site, type tests, consumer apps, visual regression, a contract check, coverage gates and a page per feature were proposed; the developer chose the compact set (`test-plan.md` §10). CI-built uploads and artifact-only reports are recorded as future alternatives.

**Caveat.** WebKit on Linux is not Safari; Safari-specific playback is proven on the macOS runner and on the team's devices.

## R-09 · CDN loader and chunk loading

**Decision.**
- `src/entries/cdn-loader.ts` is built as an IIFE (`player.min.js`), copied byte for byte to `cld-video-player.min.js` and to `player-full.min.js` (decided 2026-11-12). It contains the shell and sets `window.cloudinary`, and it defines `<cld-video-player>`.
- At top level (not in a callback) it reads `document.currentScript.src` and computes `base = new URL('.', src)`. The shell loads the layer with `import(new URL('./esm/player.js', base).href)`. The ESM entry name is not hashed; chunks below it are.
- ESM chunks resolve their own imports relative to their URL. Each feature chunk adds its CSS with `<link href = new URL('<name>.css', import.meta.url)>`; CSS names are predictable.
- The shell takes its layer loader as a parameter: the npm entry passes a bundler-resolved `() => import('../player/index.js')`, the CDN loader passes the computed URL. The shell code is the same in both.
- The CDN must send `Access-Control-Allow-Origin` (module scripts are fetched in CORS mode); verify for jsDelivr and unpkg in the spike.

**Rationale.** D-23 (no UMD, classic loader + ESM chunks); FR-002 (the README `<script>` keeps working). The HTML spec resolves a classic script's base from the URL it was fetched from, and dynamic `import()` works in classic scripts in every supported browser.

**Alternatives.** A module script (`type="module"`) as the CDN entry (rejected: breaks the README snippet). A configurable `publicPath` option (rejected: not needed; `currentScript` gives it).

**Spike.** Build the loader, publish to a test folder, load it from another origin with `defer` and `async`, confirm chunk and CSS loading and the 10 KB budget.

## R-10 · Custom element

**Decision.** `<cld-video-player>` is a light-DOM custom element defined in the shell (`contracts/element.md`). npm users call `defineElement()`; the CDN loader calls it. It observes only `public-id`; everything else is read at connect. It re-dispatches public events as DOM `CustomEvent`s so frameworks can listen without wrappers (D-05). Disconnect disposes the player unless the element is re-attached in the same task.

**Rationale.** Side-effect-free imports (SSR-safe, tree-shakeable); light DOM so the skin CSS and the v4 classes apply; DOM events are the framework-neutral contract.

**Alternatives.** Shadow DOM (rejected for 5.0: breaks customer CSS overrides and the v4 classes; revisit after R-05). Register on import (rejected: side effects, SSR errors).

## R-11 · Getter/setter methods

**Decision** (2026-11-12): split v4 combined getter/setters into named getters and setters (`getVolume`/`setVolume`, `getCurrentTime`/`seek`, `isLooping`/`setLoop`, …), remove `width()`/`height()` and the run-time source-default setters; keep every action method and `source()` as v4.

**Rationale.** FR-004 (one signature each). New names make old calls fail loudly (`TypeError: player.volume is not a function`), which is easier to find than a call that silently became a getter. The run-time default setters are the root of the v4 leak defects (audit D, E).

**Alternatives.** (a) Keep the v4 overloads and fix the `0` bug — no page breaks, but contradicts FR-004 and keeps the overload complexity. (b) Keep the v4 names as getters only — silent breaks for v4 setter calls. (c) Remove all of them and point to `player.videojs` — breaks pages and pushes users onto the unstable hatch.

## R-12 · Size budgets

**Decision.** See `plan.md` → "Size budgets". Fonts are tracked separately and not counted in SC-007.

**Rationale.** D-21 (keep the bundle small; tiny lazy shell); SC-007 numbers; v4 measurements from the local `dist/` (shell 4.3 KB; core ≈ 133 KB; CSS 27 KB; adaptive-streaming 162 KB; dash 199 KB; ima 20 KB; playlist 6 KB).

## R-13 · Host-product owners (D-03)

**Open, not blocking.** The products are known (Console media preview, Video Player Studio, embedded player page, SDKs and widgets, tx-builder, canvas, image-to-video). Owners are to be named by the Video team before Phase 7, when the first host moves to a v5 pre-release.
