---

description: "Task list for the Cloudinary Video Player v5 rewrite on Video.js 10"
---

# Tasks: Cloudinary Video Player v5 (rewrite on Video.js 10)

**Input**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` in `specs/001-v5-videojs10-rewrite/`

**Tests**: Included. The spec requires them (SC-002 URL parity, SC-009 accessibility, SC-010 leaks; draft constitution VII: "a pull request that changes behavior changes a test"). The strategy is `test-plan.md` (decided 2026-11-23): unit tests in Node (`test/unit/`), browser tests in Vitest browser mode (`test/browser/`), end-to-end in Playwright on the `examples/` presets (`test/e2e/`). Each test protects a user-visible behavior, a spec criterion or a fixed bug; no coverage gates.

**Organization**: By the plan's **8 delivery phases**, not by user story, because each phase is one Jira story under epic [VIDEO-21286](https://cloudinary.atlassian.net/browse/VIDEO-21286) (developer decision, 2026-11-23). Tasks that serve a user story carry its `[US#]` label; the "User story coverage" table at the end maps every story to its tasks.

**Branch**: all work happens on the long-lived `v5` git branch (D-22). `master` keeps v4.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[US#]**: the user story in `spec.md` the task serves
- Paths are relative to the repository root on the `v5` branch (`plan.md` → "Project Structure")

---

## Phase 0: Spikes (Jira story 1 · ≈ 3 eng-weeks)

**Goal**: prove the risky parts before the design is fixed, and record the v4 baselines that later phases test against.

**Exit**: every spike has a yes/no result and a code sketch in `log.md`; S-1 measures ≤ 70 KB gzip, or the developer has decided how to continue.

- [x] T001 Create the `v5` branch from `master`, and move `specs/001-v5-videojs10-rewrite/` onto it (D-22); commit the spec, plan and tasks there
- [x] T002 [P] [US2] Write `scripts/record-url-parity.mjs` that runs against the v4 build on `master` and records media, poster, caption, thumbnail and chapter URLs for the 64 v4 cases plus variables, conditions, raw transformations, codecs and `queryParams` into `test/fixtures/url-parity/*.json`
- [x] T003 [P] [US3] Collect v4 configuration samples (every `docs/*.html` demo, the four built-in profiles, a sample of saved profiles and per-asset configurations) into `test/fixtures/v4-configs/`
- [x] T004 [P] S-1 size baseline in `spikes/s1-size/` (runs first; does its own quick eject of the Default skin and a plain build, so it does not wait for T005 or T009): build shell + core stand-in (15 KB allowance) + layer + Video.js 10 with `videoFeatures` + ejected skin script and default CSS + English i18n; record the gzip size against the 60/70 KB gates (`research.md` → "Phase 0 spikes")
- [x] T005 [P] S-2 skin eject in `spikes/s2-skin/`: eject the Compat skin and the Default skin with `@scope` flattened; check both on Safari 16.4, Chrome 111 and Firefox 121; add one own control and one overlay
- [x] T006 [P] [US4] S-3 caption renderer in `spikes/s3-captions/`: tracks in `hidden` mode, own cue rendering with v4 styles and word highlight, own captions menu, native `showing` in iPhone native fullscreen
- [x] T007 [P] [US5] S-4 IMA in `spikes/s4-ima/`: IMA's `<video>` is not picked as the main media; pre-roll → content on iPhone (`disableCustomPlaybackForIOS10Plus` default vs `true`); record v4 behavior of `adsInPlaylist` and `postrollTimeout` from the v4 demo
- [x] T008 [P] [US2] S-5 DASH in `spikes/s5-dash/`: rendition and audio-track lists and ABR presets from the dash.js 5.2 engine behind `<dash-video>`, or a recorded decision to drop DASH menus (FR-014)
- [x] T009 [P] S-6 build and CDN loading in `spikes/s6-build/`: tsdown IIFE keeps native `import()`; predictable per-chunk CSS names; cross-origin load from jsDelivr and unpkg with CORS, with `defer` and `async`; loader ≤ 10 KB; ts-json-schema-generator reads TypeScript 7 types; oxlint ring rules work (`research.md` R-01, R-09)
- [x] T010 [P] [US1] S-7 media element and overlay in `spikes/s7-media/`: the integrator's `<video>` becomes the media element (`slot="media"`) for native and hls.js and survives an engine switch; overlay API drives an upcoming overlay and an end screen; check whether Video.js 10 seeks while dragging on touch (decides the `disableSeekWhileScrubbingOnMobile` behavior)
- [x] T011 Record each spike result (yes/no, sketch, numbers) in `specs/001-v5-videojs10-rewrite/log.md`; set the hls.js chunk budget in `plan.md` from T004; if S-1 > 70 KB, stop and ask the developer before Phase 1

**Checkpoint**: design confirmed; budgets final; fixtures recorded.

---

## Phase 1: Foundation (Jira story 2 · ≈ 3 eng-weeks)

**Goal**: an empty v5 package that builds, lints, tests and checks size in CI, with the test pipeline and the `examples/` presets in place (`test-plan.md`).

**Exit**: empty shell builds; CI green on a pull request; one preset passes build → e2e → Netlify preview → preview smoke.

- [x] T012 After the developer approves the D-26 drafts, add the v5 section from `drafts/agents-v5-section.md` to `AGENTS.md` and write `drafts/constitution.md` to `.specify/memory/constitution.md` (on `v5` only)
- [x] T013 Delete the v4 build and source tree on `v5`: `src/**/*.js`, `src/**/*.scss`, `webpack/`, Babel, rollup and jest configs, `test/` (v4) **except** `test/fixtures/url-parity/` and `test/fixtures/v4-configs/` (written by T002/T003), `lib/` output config; keep `docs/` v4 pages until Phase 6
- [x] T014 Rewrite `package.json`: same name, `"type": "module"`, `exports` (`.` with types, `./cld-video-player.min.css`, `./schema.json`), `sideEffects: ["*.css"]`, `engines.node >= 22.12`, the approved runtime and dev dependencies, and the scripts from `plan.md` → "Scripts"
- [x] T015 [P] Add `tsconfig.json`: TypeScript 7, `strict`, `isolatedDeclarations`, target ES2022, DOM libs, path rules for the rings
- [x] T016 [P] Add `tsdown.config.ts`: ESM build of `src/entries/index.ts` with chunks, per-chunk CSS (`css.splitting` through `@tsdown/css`, 2026-11-26) and `.d.ts`; IIFE build of `src/entries/cdn-loader.ts` → `dist/player.min.js`; copies to `dist/cld-video-player.min.js` and `dist/player-full.min.js`; CSS copies `player.min.css` / `cld-video-player.min.css`; fonts to `dist/fonts/`
- [x] T017 [P] Add `.oxlintrc.json` (no `--type-aware`: it needs `oxlint-tsgolint`, not approved) with rules: ring imports (`core` imports nothing else; `shell` imports only `core`; features import only `core` and `player/context`), banned `@internal` Video.js names (`definePlayerFeature`, `PlayerExtension`, `defineSlice`, `extensionContext`, `mediaContext`, `createMediaAttachMixin`), no `innerHTML`
- [x] T018 [P] Add `.size-limit.json` with the budgets from `plan.md` → "Size budgets" (gzip, FR-032)
- [x] T019 [P] Add `scripts/build-schema.mjs` (ts-json-schema-generator over `src/core/options/types.ts` → committed `schema.json` at the repository root, copied to `dist/schema.json` by the build; `dist/` is git-ignored) and a drift check that fails CI when the regenerated schema differs from the committed one
- [x] T020 [P] Add `vitest.config.ts` with two projects: `unit` (Node, `test/unit/**`) and `browser` (`@vitest/browser-playwright`, Chromium default, `test/browser/**`); no coverage thresholds (`test-plan.md` §2)
- [x] T021 [P] Add `playwright.config.ts`: projects branded Chrome (`channel: 'chrome'`, H.264/AAC as v4), Firefox and WebKit; `@smoke` grep for PRs; `fullyParallel`, HTML report, `retries` 1 on CI and 0 locally, test timeout 30 s and assertion timeout 5 s, `webServer` serving the built `dist/` and `examples/` locally; a separate `preview` project for `test/e2e/preview/` with the preview URL as `baseURL`
- [x] T022 [P] Add the `examples/` site (`test-plan.md` §4): `examples/presets/*.ts` (typed `Preset` data: `id`, `title`, `feature`, `players: [{ options, setup? }]`, `layout?`); `examples/player.html` (renders `?preset=<id>&delivery=cdn|npm|element`, a code panel with the snippet for the mode and a copy button, `window.examples = { players, ready }`, an accessible region per player); `examples/index.html` (presets grouped by feature, generated from `presets/`); `examples/vite.config.ts` (`src/` for `npm run dev`, built `dist/` for `build:examples`); first preset `minimal-v4` in `examples/presets/basics.ts`
- [x] T023 [P] Add the `examplePage` fixture in `test/e2e/fixtures/example-page.ts`: open a preset by id and delivery mode, wait for `window.examples.ready`, fail on console errors not in an allow list, record every request, list failed media and video-service requests, run axe (tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`); add `test/e2e/assets.ts` (every live `demo` asset and what it must have); add a CI check that bans `waitForTimeout` and `networkidle` in `test/`
- [x] T024 [P] Add `lint:package` in `package.json`: `publint` and `@arethetypeswrong/cli` on the packed package (approved 2026-11-23, `test-plan.md` §10)
- [x] T025 [P] Rewrite `docs/es-modules/netlify.toml` and `docs/es-modules/package.json` on `v5` for the current Netlify site (`test-plan.md` §6; confirm the site's base directory first; today the `prepare` script runs the v4 `build` and `build-es`): build the player and `examples/` with the CI scripts, publish `examples/` with `dist/`, write `build-info.json` with `COMMIT_REF`; add `scripts/wait-for-preview.mjs` (poll the preview's `build-info.json` until it shows the PR head commit, 10 min timeout) and `test/e2e/preview/smoke.spec.ts` (load `player.min.js` from the preview on another origin; chunks and CSS load; two presets play); any change to the Netlify site settings is an ask-first item
- [x] T026 Add `src/entries/index.ts` and `src/entries/cdn-loader.ts` stubs, a stub `src/core/options/types.ts` (empty `PlayerOptions`) with its generated `schema.json`, and the empty ring folders from `plan.md` so `build`, `typecheck`, `lint`, schema drift and `size` pass
- [x] T027 Add `.github/workflows/v5-pr.yml` (`test-plan.md` §7): four parallel jobs, each runs `npm ci` and the build itself: `checks` (typecheck, lint, `lint:package`, build, size, schema drift, unit), `browser` (Chromium), `e2e` (`build:examples`; branded Chrome full, Firefox and WebKit `@smoke`), `preview` (waits for Netlify, then the preview smoke); `concurrency` with `cancel-in-progress`; the HTML report is uploaded as an artifact and pushed to `cloudinary-video-player-reports` as in v4. Add `.github/workflows/v5-nightly.yml`: browser tests and full e2e on three engines (WebKit on macOS)
- [ ] T028 Walking skeleton: the `minimal-v4` preset passes the whole pipeline on a pull request: build → `test/e2e/minimal.spec.ts` (page loads, loader sets `window.cloudinary`, no console errors; a plain `<video>` on the page plays one H.264 HLS `demo` asset through hls.js, which proves each PR browser can decode live media before the player exists) → Netlify preview → preview smoke

**Checkpoint**: CI green on an empty package.

---

## Phase 2: Core (Jira story 3 · ≈ 4 eng-weeks)

**Goal**: all Cloudinary logic in `src/core/`, with no Video.js import, proven in Node.

**Exit**: SC-002 green (URL parity); `schema.json` generated; core unit tests pass.

### Options

- [ ] T029 [US3] Define every option once in `src/core/options/types.ts` with `@default` and `@description`, following the dispositions in `contracts/options.md` (cloud config, source options, player options) (FR-007)
- [ ] T030 [P] [US3] Add defaults in `src/core/options/defaults.ts` (v4 values, including `muted` → volume 0.4)
- [ ] T031 [P] [US3] Add the rename and removal table in `src/core/options/renames.ts`: every Map and Remove row in `contracts/options.md`, including the Video.js 8 options (`videojs`/`html5` name `player.videojs`; `videoJS`, `qualitySelector`, `ima` get the generic message; `textTrackSettings` says "5.x")
- [ ] T032 [US3] Implement `normalizeOptions` in `src/core/options/normalize.ts`: cloud settings from `cloud_name`/`cloudName` at top level or in `cloudinaryConfig`; player/source split; profile and per-asset config merge order (`data-model.md` §12, `{...playerOptions, ...sourceOptions, ...options}`); frozen result (FR-006)
- [ ] T033 [P] [US3] Implement the debug report in `src/core/options/validate.ts` (unknown, renamed, removed and invalid options, FR-008) and the always-on secrets warning for `api_secret`, `sign_url`, `auth_token` (FR-029)
- [ ] T034 [P] [US1] Implement `<video>` attribute parsing in `src/core/options/attributes.ts`: `data-cld-*` plus native media attributes, the `cld-fluid`/`vjs-fluid` class, value parsing rules (`contracts/element.md`, FR-036)

### URLs and sources

- [ ] T035 [P] [US2] Implement the delivery prefix in `src/core/url/cloud.ts`: every cloud-config key in `contracts/options.md` (`secure`, `private_cdn`/`privateCdn`, `secure_distribution`/`secureDistribution`, `cname`, `cdn_subdomain`, `secure_cdn_subdomain`, `use_root_path`, `url_suffix`, `shorten`)
- [ ] T036 [US2] Implement the own transformation builder in `src/core/url/transformation.ts`: every key in `research.md` R-07, variables, `if` conditions, chains and raw strings (`rawTransformation`), v4 input format (D-10)
- [ ] T037 [US2] Implement media, poster, thumbnail-sprite and caption URLs in `src/core/url/media-url.ts` (`publicId` or raw URL, `resourceType`, `sourceTransformation` per source type, `posterOptions`, source types, codecs, automatic format, `queryParams`, `breakpoints`/`maxDpr`, `aspectRatio` with `cropMode`/`cropPadColor`, `hdr`; width, DPR and HDR support are inputs, so the core stays pure) (FR-012)
- [ ] T038 [P] [US2] Implement codec and source-type helpers in `src/core/source/codecs.ts`
- [ ] T039 [US2] Implement `buildSource` in `src/core/source/build-source.ts`: pure, immutable `Source` (`data-model.md` §3); no state shared between calls (FR-009)
- [ ] T040 [P] [US2] Implement renditions in `src/core/source/renditions.ts`: `url`, `mimeType`, `sourceType`, `engine` (native/hls/dash), ordered for fallback (FR-013)
- [ ] T041 [P] [US2] Implement poster precedence in `src/core/source/poster.ts`: explicit → saved (video-elements URL, FR-038) → image → waveform (`data-model.md` §5)

### Video service, tracks, playlist, events, errors

- [ ] T042 [US3] Implement the one video-service client in `src/core/video-service.ts`: `profileUrl`, `assetConfigUrl`, `posterUrl`, `chaptersUrl`, `transcriptUrl`, `metadataUrl`; base64 as v4; `_s=vp` with `allowUsageReport`; credentials; `AbortSignal`; the `X-Cld-Video-Player-Version` header (`contracts/video-service.md`)
- [ ] T043 [P] [US4] Implement `src/core/tracks/vtt.ts`, `src/core/tracks/srt.ts` (SRT → cues, replaces `srt-parser-2`) and `src/core/tracks/transcript.ts` (transcript → cues with word timings; waits on 202 while pending)
- [ ] T044 [P] [US6] Implement playlist state in `src/core/playlist/state.ts`: items, index, auto-advance, repeat, queue-safe next/previous (`data-model.md` §8)
- [ ] T045 [P] [US9] Implement `PlayerEventMap` and the extended-event logic in `src/core/events.ts`: `percentsplayed`/`timeplayed` (`playedEventPercents`, `playedEventTimes`), `seek {seekStart, seekEnd}`, `pausenoseek`, `start`, `mute`/`unmute` (`contracts/events.md`, FR-027)
- [ ] T046 [P] [US9] Implement the usage-report payload in `src/core/analytics/usage-report.ts`: player version, cloud name and features only (FR-028)
- [ ] T047 [P] [US2] Implement `src/core/errors.ts`: Cloudinary error mapping from the error-header probe (`HEAD`, or `GET` with credentials and a `Range: bytes=0-0` header when `fetchErrorUsingGet`); the not-ready watchdog (`maxTries` × `videoTimeout`); live "not started" retry policy (FR-016)

### Core tests

- [ ] T048 [US2] Add `test/unit/url-parity.test.ts`: every fixture in `test/fixtures/url-parity/` matches, or is listed in `test/fixtures/url-parity/intentional-changes.json` (SC-002, FR-011)
- [ ] T049 [P] [US3] Add `test/unit/options/*.test.ts`: normalization, renames, debug report, secrets warning, attributes, profile merge; port the 19 validator cases from the v4 jest files on `master`
- [ ] T050 [P] [US2] Add `test/unit/source/*.test.ts`: source isolation (US2-2), rendition order, poster precedence
- [ ] T051 [P] Add `test/unit/video-service.test.ts` (mocks from `test/fixtures/video-service/*.json`, recorded from the live service), `test/unit/tracks/*.test.ts`, `test/unit/playlist-state.test.ts`, `test/unit/events.test.ts`, `test/unit/errors.test.ts`, `test/unit/usage-report.test.ts` (fetch mocked)
- [ ] T052 Generate and commit `schema.json` (repository root) through T019; drift check green

**Checkpoint**: core complete and proven without a browser.

---

## Phase 3: Shell and layer (Jira story 4 · ≈ 5 eng-weeks)

**Goal**: the minimal embed plays, through both factories and the element, from the CDN and npm.

**Exit**: US1, US2 and US8 acceptance scenarios pass (quickstart S1–S6, S8, S14–S16; S20 runs in T123).

### Shell (≤ 10 KB)

- [ ] T053 [US1] Implement `VideoPlayer` in `src/shell/video-player.ts`: before-ready queue for actions and setters; `on`/`one`/`off`/`trigger` on an `EventTarget` at once; known-value getters before ready; split getters/setters (`getVolume`/`setVolume`, `getCurrentTime`/`seek`, `isLooping`/`setLoop`, …); `dispose` cancels setup; chaining (`contracts/public-api.md`, FR-004, FR-005)
- [ ] T054 [US1] Implement `videoPlayer`, `videoPlayers`, `player`, `players` in `src/shell/factories.ts`: target resolution, synchronous vs Promise forms, throw/reject on a missing target (FR-001, FR-003)
- [ ] T055 [US3] Apply saved configuration in `player()`/`players()` in `src/shell/factories.ts` (`videoConfig`, default `true`; ignored by `videoPlayer()`): fetch profile and per-asset config through `video-service.ts`, merge, resolve the Promise after it applies (US3-3, US3-4, FR-010, FR-037)
- [ ] T056 [US1] Implement `<cld-video-player>` and `defineElement()` in `src/shell/element.ts`: kebab-case attributes, JSON attributes, `options` and `player` properties, observes `public-id` only, re-dispatches public events as `CustomEvent`s, disposes on disconnect unless moved (`contracts/element.md`)
- [ ] T057 [US2] Paint the poster in `src/shell/poster.ts` before any layer code runs (saved poster URL from T041; SC-012); no change when the per-asset config arrives
- [ ] T058 [P] [US8] Implement lazy mode in `src/shell/lazy.ts`: poster and play button only; load the layer on interaction or on scroll into view (FR-024)
- [ ] T059 [P] [US8] Implement schedules in `src/shell/schedule.ts`: the player becomes available when a window opens, without reload (FR-025)
- [ ] T060 [US1] Implement `src/shell/load-player.ts`: the layer loader is a parameter (bundler import for npm, computed URL for CDN)

### Entries

- [ ] T061 [US1] Implement `src/entries/cdn-loader.ts`: read `document.currentScript.src` at top level, compute the base URL, set `window.cloudinary` (factories, `VideoPlayer` class), call `defineElement()` (`research.md` R-09, FR-031)
- [ ] T062 [P] [US1] Implement `src/entries/index.ts`: export the factories, `CldVideoPlayer`/`VideoPlayer`, `defineElement` and the public types; no side effects on import (`contracts/distribution.md`)

### Layer

- [ ] T063 [US1] Eject the skin chosen in S-2 into `src/skins/` without restyling, so the layer, menus and controls have a home (restyle is T081)
- [ ] T064 [US1] Implement `src/player/create.ts`: `createPlayer({ features: videoFeatures })`, mount the skin, adopt the integrator's `<video>` as `slot="media"`, keep the v4 container classes (`.cld-video-player`, `.cld-fluid`)
- [ ] T065 [US2] Implement `src/player/media.ts`: rendition → native `<video>`, `<hlsjs-video>` or `<dash-video>`; fallback to the next rendition on error (FR-013); replace the media element on an engine switch; `withCredentials` for every source request, including hls.js and dash.js (FR-015)
- [ ] T066 [US9] Implement `src/player/event-bridge.ts`: media events and store changes → public events on the shell's `EventTarget`; `playerload`/`ready`/`videoload` reach early listeners; ad hooks `onPlayRequest`, `setAdActive`, `holdEnded` (R-03, R-04)
- [ ] T067 [P] Implement `src/player/context.ts`: the `FeatureContext` (`media`, `root`, store access, `source$`, `signal` aborted on source change, `emit`, `onDispose`, `setControlsVisible`, `setAdActive`)
- [ ] T068 Implement `src/player/features.ts`: option → lazy feature module map; `setup(ctx)` returns `teardown`; re-setup on source change (FR-022)
- [ ] T069 [US1] Expose `player.videojs` as the raw Video.js 10 player in `src/player/create.ts` (FR-035, D-30)
- [ ] T070 [US1] Apply the basic player options in `src/player/create.ts`: `autoplay`, `autoplayMode` (`always`/`never`), `muted` (volume 0.4), `loop`, `controls`, `playsinline`, `preload`, `fluid` and `aspectRatio` layout; measure container width, `devicePixelRatio` and HDR display support and pass them to `buildSource` (`breakpoints`, `maxDpr`, `hdr`); the split setters from T053 call the same code
- [ ] T071 [US2] Implement `src/features/adaptive/` (`adaptiveStreaming`): ABR strategy presets and HDR preference for hls.js; quality and audio-track menus through public store actions (`selectVideoRendition`, `selectAudioTrack`); DASH per S-5 result (FR-014)
- [ ] T072 [US2] Wire the live "not started" retry and the not-ready watchdog from `src/core/errors.ts` into `src/player/media.ts` (US2-5)
- [ ] T073 [US2] Support audio-only sources (`sourceTypes: ['audio']`) in `src/player/media.ts`: audio rendition, waveform poster, layout without a video area
- [ ] T074 [US2] Implement the own error display (`UIElement`) in `src/player/error-display.ts`: Cloudinary messages from `src/core/errors.ts` (missing, processing, unauthorized, rate-limited, live not started), English strings through `registerI18n`, text only (FR-016, FR-030)

### Shell and layer tests

- [ ] T075 [P] [US1] Add `test/browser/shell/*.test.ts`: before-ready queue (US1-4), factories, element attributes and events, dispose during setup, many players on one page stay independent (FR-026)
- [ ] T076 [P] [US8] Add `test/browser/shell/lazy.test.ts` and `test/browser/shell/schedule.test.ts` (fake timers)
- [ ] T077 [P] [US2] Add `test/browser/player/*.test.ts`: engine selection, fallback, engine switch keeps the integrator's `<video>`, event bridge
- [ ] T078 [US1] Add presets `minimal-v4`, `api`, `poster`, `adaptive-streaming`, `profiles`, `lazy-player`, `schedule`, `multiple-players` in `examples/presets/` (each runs in the three delivery modes)
- [ ] T079 [US1] Add `test/e2e/*.spec.ts` for quickstart S1–S6, S8 and S14–S16 with the `examplePage` fixture and direct `player.html?preset=…&delivery=…` URLs: every scenario in `cdn` mode, `@smoke` cases also in `npm` and `element` modes; tag S1, S2, S6 as `@smoke`; S1 is the v4 minimal snippet unchanged (FR-002)
- [ ] T080 [US1] Add `test/unit/node-import.test.ts`: the built package, imported by name in Node, loads without DOM errors (SSR safety, FR-031)

**Checkpoint**: MVP — the v4 README snippet and the element snippet play on v5.

---

## Phase 4: Skin and base UI (Jira story 5 · ≈ 4 eng-weeks)

**Goal**: the v4 look (dark and light) on the ejected Video.js 10 skin, with the base controls, accessible.

**Exit**: SC-009 on the default skin (zero axe violations, keyboard only); default CSS ≤ 12 KB.

- [ ] T081 [US1] Restyle the ejected skin in `src/skins/` to the v4 dark and light skins (FR-040); one set of CSS tokens; `skin` option switches dark/light
- [ ] T082 [P] [US7] Implement `src/features/colors/`: `colors` → CSS variables (`--color-*`)
- [ ] T083 [P] [US1] Add Inter (Latin subset, ≤ 2 weights, `woff2`) served from Cloudinary with `@font-face` in `src/skins/` and `font-display: swap`; `fontFace` loads a named font when set (FR-041)
- [ ] T084 [P] [US1] Add SVG icons in `src/icons/` (v10 icons plus our own; no icon font)
- [ ] T085 [US1] Implement `bigPlayButton: 'init'`, the Video.js 10 mobile controls and `playbackRates` (speed button with the `rates` list) in `src/skins/`
- [ ] T086 [P] [US7] Implement `src/features/title/` (title and description from options or `info`, rendered as text)
- [ ] T087 [P] [US7] Implement `src/features/logo/` (`showLogo`, `logoImageUrl`, `logoOnclickUrl`; URL checked, text only)
- [ ] T088 [P] [US7] Implement `src/features/jump/` (±10 s buttons, `showJumpControls`)
- [ ] T089 [P] [US7] Implement the picture-in-picture toggle (`pictureInPictureToggle`) through the public Video.js 10 control in `src/skins/`
- [ ] T090 [P] [US7] Implement `src/features/context-menu/` (`hideContextMenu`)
- [ ] T091 [US4] Accessibility pass on the default skin in `src/skins/` and the base-UI features: keyboard order, visible focus (no text-shadow focus), accessible names, contrast in dark and light (FR-019)
- [ ] T092 [P] [US4] Add `test/browser/skin/*.test.ts` (keyboard and names per control) and `test/e2e/a11y.spec.ts` (axe on both skins, `@smoke` on the default skin)

**Checkpoint**: v4 look with base controls; accessible.

---

## Phase 5: Features (Jira story 6 · ≈ 14 eng-weeks)

**Goal**: every remaining Keep/Replace/New feature in the 5.0 feature list, each a lazy module with `setup`/`teardown`.

**Exit**: US4, US5, US6, US7 and US9 acceptance scenarios pass (quickstart S9–S13, S17, S18).

### Captions, chapters, thumbnails, graph

- [ ] T093 [US4] Implement `src/features/captions/`: load VTT, SRT and transcript tracks (`textTracks`), own renderer from S-3 with `textTracks.options` styles and word highlight, own captions menu, native `showing` in iPhone fullscreen, pending transcripts shown once ready (FR-017)
- [ ] T094 [P] [US7] Implement `src/features/chapters/`: chapters track for seek-bar segments plus the own chapters menu (`chapters`, `chaptersButton`)
- [ ] T095 [P] [US7] Implement `src/features/thumbnails/`: metadata track with `label="thumbnails"` and `#xywh` cues from the Cloudinary sprite (`seekThumbnails`)
- [ ] T096 [P] [US7] Implement `src/features/highlights-graph/` (`aiHighlightsGraph`)
- [ ] T097 [US4] Add `test/browser/features/text-tracks.test.ts`: captions, chapters, thumbnails and graph together; loading or removing captions keeps the other tracks (FR-018, FR-023)

### Overlay, playlist, recommendations

- [ ] T098 [US7] Implement `src/features/overlay/` and `player.addOverlay()`: content (element, factory or `{title, text, image, actions}` as text), triggers (`at`, `beforeEnd`, `ended`, `manual`), placements, `dismissible`, `pausesPlayback`, focus in/out, `Escape`; removed on source change (FR-039, `contracts/public-api.md`)
- [ ] T099 [US6] Implement `src/features/playlist/`: `playlist()`, `playlistByTag()`, `sourcesByTag()`, auto-advance, repeat, `playNext`/`playPrevious` queued before load, events `playlistcreated`, `playlistitemchanged {playlist, current, next}` (FR-021)
- [ ] T100 [P] [US6] Implement the playlist widget (`playlistWidget`: vertical, horizontal, custom render; `direction`, `total`, `show`, `selector`, `renderTo`, `useCustomLayout`) in `src/features/playlist/widget.ts`
- [ ] T101 [P] [US6] Implement the upcoming-video overlay on the overlay feature (`upcomingvideoshow`/`upcomingvideohide`) in `src/features/playlist/upcoming.ts`
- [ ] T102 [P] [US6] Implement `src/features/recommendations/`: end screen on the overlay feature (`recommendations`, `autoShowRecommendations`)

### Ads

- [ ] T103 [US5] Implement `src/features/ads/`: load `ima3.js` with timeout and error = "no ads, play content"; one `AdDisplayContainer` and `AdsLoader`; states `idle → waiting → ad → content → postroll-wait → done`; idempotent resume; `ResizeObserver` resize; iPhone branch (R-04, FR-020)
- [ ] T104 [US5] In `src/features/ads/`, map the ad settings (`locale`, `adTagUrl`, `showCountdown`, `adLabel`, `prerollTimeout`, `postrollTimeout`) and implement `adsInPlaylist` (`first-video`, `every-video`) with the v4 behavior recorded by S-4 (ads are requested once per page; a per-item fix is a future option, `log.md` §8); honor `postrollTimeout` (v4 ignored it; default 5000 ms)
- [ ] T105 [P] [US5] Add `test/browser/features/ads.test.ts` with a fake `google.ima` (pre-roll, blocked SDK, ad error, playlist ads, post-roll hold)

### Other features

- [ ] T106 [P] [US7] Implement `src/features/download/` (`download`)
- [ ] T107 [P] [US7] Implement `src/features/source-switcher/` (`videoSources`)
- [ ] T108 [P] [US7] Implement `src/features/floating/` (`floatingWhenNotVisible`)
- [ ] T109 [P] [US7] Implement `src/features/autoplay-on-scroll/` (`autoplayMode: 'on-scroll'`)
- [ ] T110 [P] [US9] Implement `src/features/analytics-ga/` (opt-in `analytics`)
- [ ] T111 [P] [US9] Implement `src/features/cloudinary-analytics/` (`cloudinaryAnalytics`) with `cloudinary-video-analytics` (on by default) and send the usage report from T046 (FR-028)

### Feature tests and demos

- [ ] T112 [P] [US7] Add `test/browser/features/<name>.test.ts` for each feature: setup, source change without leftover state (US7-1), teardown leaves nothing (US7-2)
- [ ] T113 [US4] Add presets `captions`, `ads`, `playlist`, `overlay` and one per remaining kept feature in `examples/presets/` (SC-003, FR-033)
- [ ] T114 [P] Add `test/unit/presets.test.ts`: every kept feature in the 5.0 feature list has a preset; preset ids are unique (SC-003)
- [ ] T115 [US4] Add `test/e2e/*.spec.ts` for quickstart S9–S13, S17 and S18; tag one case each as `@smoke`

**Checkpoint**: feature-complete 5.0.

---

## Phase 6: Migration and docs (Jira story 7 · ≈ 3 eng-weeks)

**Goal**: a v4 customer can upgrade in under 30 minutes.

**Exit**: SC-004 (≥ 90 % of v4 samples run unchanged; the rest log a message that names the fix) and SC-005.

- [ ] T116 [US3] Write `docs/v5/MIGRATION.md`: the rename table printed from `src/core/options/renames.ts`; every deliberate break (`.vjs-*` selectors, `{id}_html5_api`, `cldsourcechanged`, error details in `eventData`, split getters/setters, `width()`/`height()`, `Cloudinary.new()` (FR-034), CommonJS, Video.js 8 options, `player.videojs` as an escape hatch, removed CDN files)
- [ ] T117 [P] [US3] Generate the option reference `docs/v5/options.md` from the committed `schema.json` in `scripts/build-option-docs.mjs`
- [ ] T118 [P] Rewrite `README.md` for v5 (CDN, npm, element, minimal snippet unchanged)
- [ ] T119 [US3] Add `test/e2e/v4-configs.spec.ts`: run every sample in `test/fixtures/v4-configs/` with `debug: true`; report the share that runs unchanged and check the debug message for the rest (S7, SC-004)
- [ ] T120 [US3] Time a migration of a typical v4 configuration with the guide and record the result in `log.md` (SC-005)
- [ ] T121 Remove the v4 demo pages from `docs/` and `docs/es-modules/` on `v5` once every kept feature has a preset (SC-003); keep `docs/es-modules/netlify.toml`, which builds the v5 preview

**Checkpoint**: migration ready.

---

## Phase 7: Hardening and release candidate (Jira story 8 · ≈ 3 eng-weeks)

**Goal**: every success criterion proven; first internal host on a pre-release.

**Exit**: all SC pass; release checklist signed.

- [ ] T122 [P] Add `test/e2e/dispose.spec.ts`: 100 create/dispose cycles, no listeners, timers, observers or elements left (S19, SC-010, FR-005)
- [ ] T123 [P] [US2] Add `test/e2e/hosts.spec.ts`: default options make requests only to Cloudinary hosts and the page host (S20, SC-013)
- [ ] T124 [P] Add `scripts/bench-ttff.mjs` (`npm run bench:ttff`): time to first frame, v4 vs v5, same page and network (S21, SC-006)
- [ ] T125 [P] Map every defect in `audit.md` to a v5 test or "not applicable" in `test/AUDIT-COVERAGE.md` (SC-011)
- [ ] T126 [P] Add a CI step that counts own TypeScript lines in `src/` (ejected skin script and markup included, CSS excluded) against 5,850 (SC-008)
- [ ] T127 Review size budgets with real numbers and lower any budget that has headroom in `.size-limit.json` and `plan.md` → "Size budgets"
- [ ] T128 Run the full e2e suite on three engines (WebKit on macOS) and fix, or skip with a ticket, every failure
- [ ] T129 Run the WebView checks (S1, S2, S6, S9, S11) on the team's iPhone and Android devices and record them in `docs/v5/release-checklist.md`
- [ ] T130 Set `package.json` to `5.0.0-rc.0`, publish it to npm (pre-release tag) and to a CDN test folder; move the first internal host product to it (owners per host from D-03)

**Checkpoint**: release candidate.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 0** → blocks everything. A "no" on S-1 stops the plan until the developer decides.
- **Phase 1** → after Phase 0 and after the developer approves the D-26 drafts (T012).
- **Phase 2** → after Phase 1. Core needs no browser and no Video.js.
- **Phase 3** → after Phase 2 (shell and layer read core).
- **Phase 4** → after Phase 3 (skin mounts in the layer). Can overlap with the start of Phase 5 for features with no UI (analytics, playlist state).
- **Phase 5** → after Phase 3; UI features after Phase 4. Features are independent of each other (lint-enforced), so they run in parallel.
- **Phase 6** → after Phase 5 (the guide lists the final breaks); T117 and T118 can start earlier.
- **Phase 7** → after Phase 6.

### Inside phases

- Phase 1: T014 → T015–T022; T022 → T023, T025; T026 → T027 → T028.
- Phase 2: T029 → T030–T034; T035–T038 → T039 → T040–T041; T048 needs T036–T037.
- Phase 3: T053 → T054–T057; T063 → T064 → T065–T073 and T074; T078 → T079.
- Phase 5: T098 (overlay) → T101, T102; T099 → T100, T101; T103 → T104.

### Parallel examples

```text
# Phase 0: all spikes at once (different folders)
T004 S-1 size · T005 S-2 skin · T006 S-3 captions · T007 S-4 IMA · T008 S-5 DASH · T009 S-6 build · T010 S-7 media

# Phase 2: independent core modules
T035 url/cloud.ts · T043 tracks/* · T044 playlist/state.ts · T045 events.ts · T046 usage-report.ts · T047 errors.ts

# Phase 5: independent features
T094 chapters · T095 thumbnails · T096 highlights graph · T106 download · T107 source switcher · T108 floating · T109 autoplay on scroll · T110 GA
```

---

## Implementation strategy

### MVP first

1. Phases 0–2: spikes, foundation, core.
2. Phase 3: the minimal embed plays on the unstyled ejected skin (US1, US2, US8).
3. **Stop and validate**: S1–S6 and S14–S16 on three engines.
4. Phase 4: v4 look. This is the first build worth showing to internal hosts.

### Incremental delivery

Phase 5 features land one pull request at a time, each with its browser test and preset; the PR set (typecheck, lint, unit, browser, size, smoke) keeps the branch releasable.

### Team of 2–3

After Phase 3, one engineer takes skin and base UI (Phase 4), another starts the non-UI features (playlist state wiring, analytics, ads state machine with a fake IMA); a third, if present, takes captions (the largest feature).

---

## User story coverage

| Story | Priority | Main tasks | Acceptance (quickstart) |
|---|---|---|---|
| US1 Minimal embed | P1 | T010, T034, T053–T054, T056, T060–T064, T069–T070, T075, T078–T081, T083–T085 | S1–S3 |
| US2 Media delivery | P1 | T002, T008, T035–T041, T047–T048, T050, T057, T065, T071–T074, T077, T123 | S4–S6, S20 |
| US3 Upgrade from v4 | P2 | T003, T029–T033, T042, T049, T055, T116–T117, T119–T120 | S7, S8 |
| US4 Captions and a11y | P2 | T006, T043, T091–T093, T097, T113, T115 | S9, S10 |
| US5 Ads | P2 | T007, T103–T105 | S11 |
| US6 Playlists | P2 | T044, T099–T102 | S12 |
| US7 Engagement and overlays | P3 | T082, T086–T090, T094–T096, T098, T106–T109, T112 | S13 |
| US8 Loading control | P3 | T058–T059, T076 | S14–S16 |
| US9 Analytics and events | P3 | T045–T046, T066, T110–T111 | S17, S18 |

## Jira mapping (epic VIDEO-21286)

| Jira story | Phase | Tasks | Estimate |
|---|---|---|---|
| 1. Spikes and v4 baselines | 0 | T001–T011 | 3 eng-weeks |
| 2. Foundation: toolchain, CI and test pipeline | 1 | T012–T028 | 3 |
| 3. Core: options, URLs, video service | 2 | T029–T052 | 4 |
| 4. Shell and Video.js 10 layer | 3 | T053–T080 | 5 |
| 5. Skin (v4 look) and base UI | 4 | T081–T092 | 4 |
| 6. Features | 5 | T093–T115 | 14 |
| 7. Migration guide and docs | 6 | T116–T121 | 3 |
| 8. Hardening and release candidate | 7 | T122–T130 | 3 |

## Notes

- [P] tasks touch different files and depend on no unfinished task.
- Every behavior change comes with a test in the same pull request.
- Ask first (AGENTS.md): any internal Video.js API, a new dependency, a contract change, a budget change.
