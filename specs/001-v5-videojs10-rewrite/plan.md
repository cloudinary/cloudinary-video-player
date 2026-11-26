# Implementation Plan: Cloudinary Video Player v5 (rewrite on Video.js 10)

**Branch**: `001-v5-videojs10-rewrite` (spec label; code goes to the `v5` git branch, D-22) | **Date**: 2026-11-11 | **Spec**: [spec.md](spec.md)

**Input**: `spec.md` (FR-001 to FR-041, SC-001 to SC-013), `dilemmas.md` (D-01 to D-30, all answered), `audit.md`, `log.md`.

## Summary

Rebuild the player as a small TypeScript library in three rings:

1. **Core** (`src/core/`, no Video.js imports): options (one typed definition → validation, `.d.ts`, `schema.json`), one rename table, one URL builder, one video-service client, immutable `Source` building, tracks, playlist state, events and analytics payloads.
2. **Shell** (`src/shell/`, ≤ 10 KB gzip): the `VideoPlayer` class with its before-ready queue, the four v4 factory functions, `<cld-video-player>`, lazy and schedule modes, and the saved poster. It is what the CDN loader script and the npm entry expose first.
3. **Layer and features** (`src/player/`, `src/features/`): Video.js 10 player creation through public APIs, adapter selection (native, hls.js, dash.js), the event bridge, an ejected skin restyled to the v4 look, and one lazily loaded module per optional feature, each with `setup`/`teardown`.

v4 shapes stay (option names, factory forms, CDN names, `window.cloudinary`); every break is in the migration guide and, when detectable, reported in debug mode. The build is one ESM build plus classic loader scripts (D-23); size budgets are enforced in CI; tests move to browser-mode unit tests and a three-engine Playwright matrix (D-25).

## Technical Context

**Language/Version**: TypeScript 7, `strict`, `isolatedDeclarations`; output ES2022 (matches the Video.js 10 floor). Node 24 (`.nvmrc`; Vitest 5 needs ≥ 22.12).

**Primary Dependencies** (runtime — new ones need approval, see "Approvals"):

| Package | Why | Replaces (v4) |
|---|---|---|
| Video.js 10 packages, 10.3.0 (`@videojs/html` with `createPlayer` + `videoFeatures`; ejected skin, R-05) | Player, store, controls, captions, chapters segments, storyboard thumbnails, PiP, fullscreen, hotkeys, i18n | `video.js` 8, `videojs-per-source-behaviors` |
| `@videojs/hlsjs-video` (10.3.0 pins hls.js 1.7.3) | HLS incl. AES-128 and TS live (D-18) | `hls.js`, vendored contrib-hlsjs, `videojs-contrib-quality-levels/-menu` |
| `@videojs/dash-video` (10.3.0 pins dash.js 5.2.0) | DASH (D-18) | `videojs-contrib-dash` |
| Google IMA SDK `ima3.js` (runtime script, not npm) | Ads, only when `ads` is set (D-13) | `videojs-ima`, `videojs-contrib-ads` |
| `cloudinary-video-analytics` | Cloudinary analytics (kept) | same |
| `cloudinary-video-player-profiles` | Built-in profiles (kept) | same |

Removed: `@cloudinary/url-gen` (own builder, D-10), `lodash`, `uuid` (`crypto.randomUUID`), `webfontloader` (CSS `@font-face`), `srt-parser-2` (≈ 40-line SRT → cue parser in core).

**Build** (R-01): tsdown (exact pin) — one run emits the ESM entry and chunks with one CSS file per chunk and `.d.ts`, plus the IIFE loader; ts-json-schema-generator emits `schema.json`; size-limit (gzip) checks budgets; oxlint `--type-aware` + `tsc --noEmit` lint; Vite 8 serves the demo pages only. TypeScript 7 with `isolatedDeclarations`.

**Storage**: N/A (browser library; per-viewer preferences are out of scope).

**Testing** (D-25, R-08 → `test-plan.md`): Vitest 5 in Node for the core; publint + attw as a package check; Vitest browser mode (Playwright provider) for shell, layer and features; Playwright 1.65 end-to-end against locally served built files and the `examples/` presets, with live Cloudinary assets (full on branded Chrome + `@smoke` on Firefox/WebKit per PR; full three-engine run nightly, WebKit on macOS); `@axe-core/playwright` (WCAG 2.2 AA tags) plus keyboard tests; URL-parity fixtures recorded from v4; smoke test on the Netlify deploy preview. No coverage gates: each test protects a user-visible behavior, a spec criterion or a fixed bug.

**Target Platform**: Safari/iOS 16.4+, Chrome/Edge 111+, Firefox 121+, iOS WKWebView and Android System WebView at the same engines. No Smart TVs (D-27).

**Project Type**: Browser library (npm ESM package + CDN scripts).

**Performance Goals**: time to first frame ≤ v4 on the same page (SC-006); saved poster painted before any player code runs (SC-012); no layout shift when the player replaces the shell.

**Constraints**: size budgets below (FR-032, SC-007); source ≤ 5,850 lines (half of v4's 11,700, SC-008); no third-party hosts by default (SC-013); no secrets client-side (FR-029); public Video.js APIs only, with a tracked exception list (constitution draft I).

**Scale/Scope**: 30 features in the 5.0 list; ~40 public methods (dispositions in `contracts/public-api.md`); ~75 options (`contracts/options.md`); hosted by at least 7 Cloudinary products (D-03).

## Size budgets (gzip; enforced by the size tool in CI)

| Artifact | Budget | v4 today |
|---|---|---|
| Loader / shell `player.min.js` | **10 KB** (FR-032) | 4.3 KB |
| Default player: shell + main chunks + default CSS, **without** streaming engines and ads | **60 KB** start (SC-007; never > 70 KB) | ≈ 167 KB (140 KB JS + 27 KB CSS) |
| — of which default CSS (`player.min.css`, both v4-look skins) | 12 KB | 27 KB (icon font inlined) |
| Each optional feature chunk (own code) | 15 KB | e.g. playlist 6 KB, ima 20 KB |
| hls.js adapter chunk | ≤ v4 (162 KB); set after S-1 | 162 KB |
| dash.js adapter chunk | ≤ v4 (199 KB) (tracked) | 199 KB |
| Fonts (Inter, Latin subset, ≤ 2 weights, `woff2`) | Not in SC-007 (not code or styles); tracked ≤ 60 KB total, `font-display: swap` | Google Fonts request |

Budgets start here and can only go down without a plan amendment (D-21: "a principle, not a number").

## Scripts

| Script | Runs | When in CI |
|---|---|---|
| `build` | Build tool → `dist/` (loader, ESM entry and chunks, CSS, fonts, `.d.ts`, `schema.json`) | Every PR |
| `dev` | Dev server for the `examples/` presets against `src/` | — |
| `build:examples` | `examples/` presets against the built `dist/` (CI and Netlify) | Every PR |
| `lint:package` | `publint` + `@arethetypeswrong/cli` on the packed package | Every PR |
| `test:e2e:preview` | Preview smoke on the Netlify deploy preview of this commit | Every PR |
| `typecheck` | `tsc --noEmit` | Every PR |
| `lint` | Linter (R-01) incl. the ring-import rules | Every PR |
| `test:unit` | Vitest, Node: `test/unit` (core, URL parity) | Every PR |
| `test:browser` | Vitest browser mode: `test/browser` | Chromium every PR; all three engines nightly |
| `size` | Size tool against the budgets above | Every PR |
| `test:e2e:smoke` | Playwright against built files: full set on branded Chrome, `@smoke` on Firefox and WebKit, axe on the default skin | Every PR |
| `test:e2e` | Full Playwright suite on three engines (WebKit on macOS), both skins, axe everywhere | Nightly on `v5` and before every release |
| `bench:ttff` | Time to first frame, v4 vs v5 (SC-006) | Before every release |

## Feature × mechanism matrix

Every 5.0 feature mapped to how it is built. **Public** = a documented Video.js 10 API (named); **Own** = our code on the media element / DOM, outside Video.js; **Spike** = needs a proof before the design is fixed (Phase 0 spikes, R-xx).

Full table: `research.md` → R-02 "Mechanism matrix". Summary: playback, adaptive HLS with quality/audio menus, thumbnails, chapter segments, PiP, fullscreen, keyboard and i18n use **public** Video.js 10 APIs; our controls (logo, download, source switcher, chapters menu, playlist buttons, error display, AI highlights graph) are **own `UIElement`s on public APIs** inside our ejected skin; playlists, overlays, floating, autoplay on scroll, context menu, analytics, lazy, schedule and profiles are **own** code. Four items need a **spike** first: caption styling with word highlight (S-3), ads (S-4), DASH menus and ABR presets (S-5), and the size baseline (S-1). **Internal Video.js API exceptions: none planned**; a lint rule bans the `@internal` names re-exported from `@videojs/html`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the empty template. The gate below uses the **current `AGENTS.md`** (in force) and the **draft v5 constitution** (`drafts/constitution.md`, D-26, provisional until approved).

| Gate | Source | Status | Note |
|---|---|---|---|
| No TypeScript in `src` | AGENTS.md | ⚠ Conflict — justified | D-11 chose TypeScript; the `AGENTS.md` "v5 branch" draft (`drafts/agents-v5-section.md`) lifts the rule for `v5` only. Complexity Tracking row 1. |
| Ask first: adding dependencies | AGENTS.md | ✅ Approved (2026-11-12) | List in "Approvals" below. |
| Ask first: modifying webpack config | AGENTS.md | ✅ Decided | Webpack is replaced by one tool (D-23). |
| Ask first: changing `package.json` exports | AGENTS.md | ✅ Decided | D-24, plus `./schema.json` (approved 2026-11-12). |
| Ask first: major refactors | AGENTS.md | ✅ Decided | The rewrite is the approved spec. |
| Never edit `dist/` or `lib/` | AGENTS.md | ✅ Pass | `lib/` disappears in v5; `dist/` stays generated. |
| Minimize diffs / no unrelated refactors | AGENTS.md | ✅ N/A on `v5` | Applies to v4 fixes on `master` during the 6-month support window. |
| KISS, DRY, single responsibility, bundle awareness, a11y, security | AGENTS.md | ✅ Pass | Reflected in principles III–VI and in the contracts. |
| I. Standalone core, public APIs only | Draft | ✅ Pass | Lint rule bans Video.js imports in `src/core/`. No internal Video.js API planned (`research.md` R-02). |
| II. Compatible by default | Draft | ✅ Pass | Disposition tables in `contracts/`. |
| III. Small by default | Draft | ✅ Pass | Budgets above, CI gate. |
| IV. One way to do each thing | Draft | ✅ Pass | One module each: options, renames, URL builder, video service, events. |
| V. Plain data, explicit lifecycles | Draft | ✅ Pass | `data-model.md`; feature `setup`/`teardown`. |
| VI. Accessible, private, safe | Draft | ✅ Pass | FR-019/028/029/030; axe in CI. |
| VII. Tests that prove behavior | Draft | ✅ Pass | Test strategy R-08. |

**Result**: pass, with one justified conflict (TypeScript). Dependencies and the `schema.json` export were approved on 2026-11-12. Post-design re-check: see the end of this file.

## Project Structure

### Documentation (this feature)

```text
specs/001-v5-videojs10-rewrite/
├── spec.md, dilemmas.md, audit.md, log.md
├── plan.md              # this file
├── research.md          # Phase 0: decisions R-01 … R-13, spikes, mechanism matrix
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/           # Phase 1: public-api, options, events, element, video-service, distribution
├── drafts/              # D-26 drafts for review: constitution.md, agents-v5-section.md
├── checklists/requirements.md
├── test-plan.md         # test strategy, example site, CI (replaces the R-08 draft)
├── tasks.md             # 130 tasks in 8 delivery phases (one Jira story each)
└── jira-draft.md        # epic comment + 8 stories, for review before creation
```

### Source code (`v5` branch, repository root)

```text
src/
├── core/                      # no Video.js imports (lint-enforced)
│   ├── options/               # types.ts (single definition), defaults.ts, normalize.ts, renames.ts, validate.ts, attributes.ts
│   ├── url/                   # cloud.ts (prefix), transformation.ts (own builder), media-url.ts
│   ├── source/                # build-source.ts, renditions.ts, poster.ts, codecs.ts
│   ├── video-service.ts       # the one client (contracts/video-service.md)
│   ├── tracks/                # vtt.ts, srt.ts, transcript.ts
│   ├── playlist/              # state.ts (queue-safe next/previous)
│   ├── events.ts              # PlayerEventMap + extended-event logic (milestones, seek, mute)
│   ├── analytics/             # usage-report.ts
│   └── errors.ts              # Cloudinary error mapping, live retry policy
├── shell/                     # ≤ 10 KB gzip
│   ├── video-player.ts        # VideoPlayer class + before-ready queue
│   ├── factories.ts           # videoPlayer, videoPlayers, player, players
│   ├── element.ts             # <cld-video-player>, defineElement()
│   ├── poster.ts              # saved poster painted before the layer loads (SC-012)
│   ├── lazy.ts, schedule.ts   # poster + play button, time windows
│   └── load-player.ts         # dynamic import of the layer
├── player/                    # Video.js 10 layer
│   ├── create.ts              # build the v10 player + skin for one VideoPlayer
│   ├── media.ts               # rendition → adapter (native | hls | dash), fallback (FR-013)
│   ├── event-bridge.ts        # v10 state/media events → public events; ad gate
│   ├── error-display.ts       # Cloudinary error messages (UIElement, text only)
│   ├── features.ts            # option → lazy feature module map
│   └── context.ts             # the narrow FeatureContext given to features
├── features/                  # one folder per optional feature: index.ts exports setup(ctx) → teardown
│   ├── adaptive/  captions/  chapters/  thumbnails/  highlights-graph/
│   ├── title/  logo/  jump/  download/  source-switcher/  context-menu/
│   ├── overlay/  playlist/  recommendations/  ads/
│   └── floating/  autoplay-on-scroll/  colors/  analytics-ga/  cloudinary-analytics/
├── skins/                     # one ejected v10 skin, restyled to the v4 look (dark, light); other v10 skins → 5.x (R-05)
├── icons/                     # SVG
└── entries/
    ├── index.ts               # npm "."
    └── cdn-loader.ts          # classic IIFE: window.cloudinary + chunk base URL

test/
├── unit/                      # Vitest, Node: core only
├── browser/                   # Vitest browser mode: shell, layer, features
├── e2e/                       # Playwright: smoke (PR) + full matrix (release)
└── fixtures/
    ├── url-parity/            # recorded from v4 (SC-002)
    └── v4-configs/            # demo + saved profile samples (SC-004)

examples/                      # index.html, player.html?preset=<id>&delivery=cdn|npm|element, presets/*.ts (SC-003, test-plan.md §4)
docs/v5/                       # written docs: MIGRATION.md, options.md, release checklist
```

**Structure Decision**: single package, three rings (core → shell → layer/features). The ring rule is enforced by lint (`no-restricted-imports`): `core` imports nothing from the others; `shell` imports only `core` (and only the small parts: cloud prefix, poster, attributes); features import `core` and `player/context` only, never each other. The v4 tree (`src/`, `webpack/`, `test/` except the recorded fixtures) is deleted on the `v5` branch in Phase 1 (T013), after Phase 0 records the v4 baselines; `master` keeps v4.

## Delivery phases and estimate (D-28)

| Phase | Content | Exit | Estimate (eng-weeks) |
|---|---|---|---|
| 0. Spikes | S-1 … S-7 (`research.md` → "Phase 0 spikes"); record v4 URL-parity fixtures and v4 config samples | Each spike has a yes/no and a code sketch; S-1 (whole default player, same measure as the budget) ≤ 70 KB | 3 |
| 1. Foundation | `v5` branch, toolchain, CI, budgets, lint rings, fixtures in CI; test pipeline and `examples/` presets (`test-plan.md`) | Empty shell builds, CI green; one preset passes build → e2e → Netlify preview → smoke | 3 |
| 2. Core | Options + schema + renames, URL builder (parity green), sources, video service, tracks, errors | SC-002 green | 4 |
| 3. Shell + layer (P1) | VideoPlayer, factories, element, lazy, schedule, saved poster, v10 player, unstyled ejected skin, basic options, adapters, audio-only, event bridge, error display | US1, US2, US8 pass | 5 |
| 4. Skin and base UI | Restyle to the v4 look dark/light, colors, Inter, SVG icons, title, logo, jump, PiP, context menu, a11y pass | SC-009 on default skin | 4 |
| 5. Features (P2/P3) | Captions, chapters/thumbnails/graph, overlay, playlist + widget + upcoming + recommendations, ads, download, source switcher, floating, autoplay on scroll, analytics | US4–US7, US9 pass | 14 |
| 6. Migration and docs | Migration guide, option reference, README, removal of v4 demo pages | SC-004, SC-005 | 3 |
| 7. Hardening and RC | WebView checks, TTFF bench, leak test, first internal host on a pre-release | All SC pass | 3 |
| **Total** | | | **≈ 39 eng-weeks (±30 %)** — about 5 months with 2 engineers, 4 months with 3. No date (D-28). |

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Live Cloudinary media in PR e2e (developer decision, `test-plan.md` §10) | A Cloudinary outage or a changed `demo` asset fails PRs | Assets listed once in `test/e2e/assets.ts`; the report lists failed media and video-service requests; `retries: 1`. |
| Netlify builds the preview itself, on the current site (developer decision) | Player built twice; preview smoke waits up to 10 min; the site's base directory is a setting outside the repository | `docs/es-modules/netlify.toml` stays the entry point; smoke waits for the PR's commit in `build-info.json`; not counted in the PR time target; CI upload recorded as a future alternative. |
| Video.js 10 is larger than published: the CDN bundle (player + default skin + CSS + i18n) measures ≈ 92 KB gzip | SC-007 (≤ 60–70 KB) may fail | Spike S-1 first: tree-shake to `videoFeatures`, our own ejected skin, i18n on demand. If > 70 KB, stop and ask before Phase 1. |
| Captions: no custom renderer, controls use `showing` only | v4 styles and word highlight (FR-017) | Own renderer with `hidden` tracks and an own captions menu; native `showing` in iPhone fullscreen (S-3). |
| IMA's `<video>` may be picked as the main media | Ads break playback | S-4; place our media first, keep the ad container outside media discovery. |
| `<dash-video>` is "Unstable API" and lists no renditions or audio tracks | DASH quality/audio menus (FR-014) | S-5; fall back to a developer decision. |
| Ejected skin drifts from upstream | Missed Video.js fixes | Re-eject and diff on each minor (R-05). |
| tsdown is 0.x; `css.splitting` is experimental | Build breakage on upgrade | Exact pin; Rolldown fallback (R-01, S-6). |
| Ejected skin CSS uses `@scope` (Safari 17.4, Chrome 118, Firefox 146), above the floor (Safari 16.4, Chrome 111, Firefox 121) | Broken layout on supported browsers | S-2: eject the Compat skin or flatten `@scope` at build time. |
| Own code grows (caption renderer, captions/quality menus, error display, ads state) | SC-008 (≤ 5,850 lines) | Count per phase in CI (`cloc src`, TypeScript only). Ejected skin script and markup count (we own them); CSS does not (SC-008 excludes styles). |
| Ads land in Video.js "late 2026" | Our ads module may duplicate a future official one | Narrow ads interface (R-04) so it can be swapped later. |

## Approvals (AGENTS.md "ask first")

Approved by the developer on 2026-11-12:

1. **New runtime dependencies**: the Video.js 10 packages, 10.3.0 (`@videojs/html`, `@videojs/hlsjs-video` → hls.js 1.7.3, `@videojs/dash-video` → dash.js 5.2.0); IMA SDK loaded at run time.
2. **New dev dependencies**: `typescript` 7, `tsdown` (exact pin), `vite` 8 (demo server), `size-limit` + `@size-limit/file`, `ts-json-schema-generator`, `oxlint`, `vitest` 5 + `@vitest/browser-playwright`, `@playwright/test`, `@axe-core/playwright`; on 2026-11-23 also `publint` and `@arethetypeswrong/cli` (checked: MIT, npm provenance, no install scripts).
3. **Removed dependencies**: listed in Technical Context.

## Decisions taken after the plan draft (2026-11-12)

- **`schema.json`**: shipped in the package and on the CDN; `"./schema.json"` is added to `exports` (amends D-24).
- **`player-full.min.js`**: published as one more copy of the loader (zero cost; no customer page breaks).
- **v4 getter/setter methods** (`contracts/public-api.md` §3–4): split into named getters and setters (`getVolume()`/`setVolume()`, `seek()`, …) so that old calls fail loudly instead of silently; `width()`/`height()` and the run-time source-default setters are removed. Basis: the developer's FR-004 confirmation (2026-11-11: "never really in use … we can remove them").

- **Video.js 8 pass-through options** (2026-11-23): keep `playbackRates`, `maxTries`, `videoTimeout`, `fetchErrorUsingGet` (D-09); remove `videojs`, `html5` (D-30) and `videoJS`, `qualitySelector`, `ima` (no effect in v4); remove `disableSeekWhileScrubbingOnMobile` as an option but keep its behavior; remove `textTrackSettings` in 5.0 (5.x candidate). Details: `contracts/options.md`.
- **Test plan** (2026-11-23): R-08 reopened and replaced by `test-plan.md` (developer: "our current testing strategy in the player is very weak"). Compact and KISS (developer: "I'd rather keep it compact", "no coverage, only confidence"): unit, browser and end-to-end layers plus static checks; no type tests, consumer apps, visual regression, contract check or coverage gates. Full e2e on the local built artifact; live Cloudinary media; one `player.html` with presets (`?preset=&delivery=`); Netlify builds the preview on the current site as in v4, with a smoke test on it; reports pushed to the reports repository as in v4; four PR jobs. Phase 1: 2 → 3 eng-weeks.
- **Jira** (2026-11-23): one story per delivery phase (8 stories) under the existing epic VIDEO-21286; a short plan summary as a comment on the epic; the epic's status and due date stay as they are.

## Still open, not blocking

- **Other Video.js 10 skins** (FR-040 lets the plan decide): not in 5.0, moved to 5.x (R-05). Packaged skins cannot take our controls, so features would silently disappear.
- **Owner per hosting product** (D-03): Console, Studio, embedded page, SDKs/widgets, tx-builder, canvas, image-to-video — names to be filled by the Video team before Phase 7.
- **Usage-report data list**: product manager approval (D-14) before Phase 5 analytics work.

## Complexity Tracking

| Violation | Why needed | Simpler alternative rejected because |
|---|---|---|
| TypeScript in `src/` (AGENTS.md "no TypeScript") | One typed source drives validation, `.d.ts` and `schema.json` (FR-007, D-11); v4's hand-written types drifted (audit C). | JSDoc types: no single generated schema without a second tool, weaker checks, same build step anyway. |
| Three rings instead of one flat `src/` | Keeps the core free of Video.js (constitution draft I) and the shell ≤ 10 KB (FR-032). | Flat tree: nothing stops shell code from pulling the layer into the 10 KB file; v4's coupling returns. |
| Own ads state handling (replaces contrib-ads) | Video.js 10 has no ads framework; contrib-ads needs Video.js 8. | Waiting for Video.js ads support: no date on the roadmap; ads are in 5.0 (D-01). |

## Post-design Constitution re-check

Re-checked after `research.md`, `data-model.md`, `contracts/` and `quickstart.md` (2026-11-11).

| Gate | Result | Evidence |
|---|---|---|
| I. Standalone core, public APIs only | ✅ Pass | Mechanism matrix (R-02): no internal Video.js API planned; ring and `@internal`-name lint rules. |
| II. Compatible by default | ✅ Pass | Disposition tables in `contracts/options.md`, `public-api.md`, `events.md`, `distribution.md`. Deliberate breaks for the migration guide: `.vjs-*` CSS selectors, `cldsourcechanged`, error details moved to `eventData`, removed options and methods, CommonJS, `Cloudinary.new()`. `player-full.min.js` stays as a loader copy. |
| III. Small by default | ⚠ At risk | Budgets set; Video.js 10 baseline measured larger than published. Gate: spike S-1 before Phase 1. |
| IV. One way to do each thing | ✅ Pass | One module each: `options/types.ts`, `renames.ts`, `url/transformation.ts`, `video-service.ts`, `events.ts`; one ejected skin. |
| V. Plain data, explicit lifecycles | ✅ Pass | `data-model.md` (immutable `Source`, lifecycles); feature `setup`/`teardown`; one `AbortSignal` per source. |
| VI. Accessible, private, safe | ✅ Pass | Text-only rendering in overlays and titles; secrets dropped; fonts from Cloudinary; axe with WCAG 2.2 AA tags. |
| VII. Tests that prove behavior | ✅ Pass | R-08; URL fixtures recorded from v4; quickstart S1–S21. |
| AGENTS.md: TypeScript | ⚠ Justified | Complexity Tracking row 1; lifted only by the approved `v5` section. |
| AGENTS.md: ask first (deps, exports) | ✅ Approved (2026-11-12) | "Approvals"; `./schema.json` export. |

**Result**: the design passes, on one condition: spike S-1 confirms the size budget.
