# Decision log — v5 rewrite on Video.js 10

Feature: rewrite the Cloudinary Video Player (v5) on Video.js 10. Refactor all own additions, plugins and logic; fix historical mistakes and over-complexity. Goal: simple, elegant, focused, clear.

## 1. Context

- 2026-10-14 — Sherpa engaged at the developer's request. Developer chose the order: big questions in chat → spec → "dilemmas" file with recommended answers for the remaining questions. Plan (stage 2) follows once dilemmas are answered; the spec here describes *what*, not *how*.
- 2026-10-14 — Sources consulted:
  - Codebase audit (4 parallel reviews: source pipeline/config, plugins/UI, build/types/tests/docs, Video.js 10 research). Full findings: `audit.md` in this directory.
  - Video.js 10 primary sources: videojs.org docs, changelog 10.0.0/10.1.0, GA and beta blog posts, npm registry, GitHub `videojs/video.js` PR #9477.
  - Probe of Cloudinary demo HLS/DASH (`sp_auto/dog.m3u8`, `.mpd`): fMP4 + byte-range, muxed audio/video.
  - `.sherpa/FLOW.md`, `AGENTS.md`, `.specify/` (constitution is still the empty template).
- 2026-10-14 — Key finding: Video.js 10 is a rebuild, not an upgrade. No `videojs()`, no `registerPlugin`/`registerComponent`, no ads, no playlists, no context menu; custom feature/extension APIs are `@internal`. Our plugins have no public home in v10 → the integration model is the first gating decision.
- 2026-10-14 — Jira: no ticket or epic known yet. Grooming notes: none found. Asked the developer.
- 2026-10-14 — AGENTS.md rules that conflict with a rewrite: "no TypeScript in src", "minimize diffs", "ask first: deps, webpack, exports, major refactors". Not treated as waived; asked the developer explicitly.

### Readiness assessment (before the big questions)

| Area | Confidence | Gap | Why it matters |
|---|---|---|---|
| Requirements | 40% | No ticket, no grooming, feature scope for 5.0 undecided, no usage data per feature | Scope drives size of the rewrite and what v4 must keep supporting |
| Architecture | 55% | Integration model with v10 undecided; public API shape undecided | Every module depends on it |
| Existing implementation | 85% | Some audit findings not re-verified (marked in audit.md) | Low risk; verify while porting |
| Testing | 60% | Portable unit tests identified; e2e must be rewritten (selectors tied to v8 DOM) | Need parity checks for the rewrite |
| UX | 30% | No design for v5; v10 skins differ from v4 look; ejected-skin strategy open | Visual parity vs. new look is a product call |

Recommendation: collect more — answer the big questions, write the spec, then resolve the dilemmas before planning.

### Big questions — round 1 (2026-10-14)

- **v10 integration model → own core + thin adapter.** A standalone Cloudinary core (source → URLs, poster, tracks, config) with no Video.js imports; a thin adapter connects it to v10 via public APIs only. Rejected: "public v10 APIs only" (joins Cloudinary logic to UI), "v10 internal APIs" (`@internal`, can break on minor releases).
- **Compatibility → breaking v5, but configs stay as close to v4 as possible, and very simple usage must "just work".** Interpretation: option names/shapes of v4 are the default; change one only when it is clearly wrong, and list each change in the migration guide. The minimal v4 snippet (cloud name + public ID → playing video) must keep working. Rejected: full v4 compatibility; separate compat shim.
- **Ads → in 5.0.** We build our own IMA integration (v10 has none). Rejected: deferring to 5.x; removing ads.
- **Language → TypeScript.** Requires an explicit amendment to the AGENTS.md "no TypeScript in src" rule for v5 work.

### Big questions — round 2 (2026-10-14)

- **Public API → JS factory + custom element.** `cloudinary.player(id, options)` keeps the v4 snippet working; `<cld-video-player …>` is added. Same options, same core.
- **Delivery → full parity at 5.0.** 5.0 ships every v4 feature we decide to keep (incl. ads). One release; later date accepted. Work still lands as small PRs on a v5 branch.
- **Jira → draft an epic.** Draft goes in this log; create in Jira only after the developer approves the text (Jira descriptions must be ADF).
- **Browsers → developer asked why WebViews are excluded.** Correction of an earlier overstatement: v10 docs (videojs.org browser-support guide, "Rendering contexts") do not exclude WebViews. They say v10 "targets standard browser environments" and ask integrators to test each WebView they support. WKWebView (iOS 16.4+) and Android System WebView (Chromium 111+) use the same engines as the supported browsers, so they meet the floor; autoplay, fullscreen and hardware acceleration can differ. Smart TVs / set-top boxes are explicitly not a supported target today. Re-asked the floor question with this correction.
- **Browsers → v10 floor + WebViews.** Safari/iOS 16.4+, Chrome/Edge 111+, Firefox 121+, plus iOS WKWebView and Android System WebView at the same engine versions. WebView checks go into the test plan. Smart TVs / set-top boxes out of scope. Older browsers stay on v4.

## 3. Spec (written before the plan, by developer choice)

- 2026-10-14 — Developer asked for the spec right after the big questions; the remaining open questions go to `dilemmas.md` with recommended answers. Plan (stage 2) happens after dilemmas are answered. Recorded as an explicit reorder, not a skip.
- 2026-10-18 — Spec written: `spec.md` (9 user stories, 33 FRs, 11 success criteria). Quality checklist: `checklists/requirements.md` — all items pass except 3 [NEEDS CLARIFICATION] markers kept on purpose and pointed at `dilemmas.md` (D-01 feature list, D-02 saved server configs, D-14..D-16 analytics/privacy defaults). Tech names (Video.js 10, TypeScript, core/adapter) appear only under "Decided constraints", since they are product decisions for this rewrite.
- 2026-10-18 — `dilemmas.md` created: 29 open questions with options and a recommended answer each, plus a bulk-accept line. Includes the Jira epic draft (D-29); nothing created in Jira yet.
- 2026-10-18 — Noted: the developer is now on branch `fix/VIDEO-21243-format-opt-out`; `specs/` is untracked and should move to the `v5` branch (D-22). Spec tooling did not create or switch branches.
- 2026-10-18 — Noted risk: unpinned jsDelivr URLs (README form) will load v5 on release day (D-06).
- 2026-10-18 — Review pass: FR-022/FR-033 aligned with D-01 (Keep, Merge or Replace); checklist "scope bounded" unticked until D-01 is answered; D-08 trade-off noted (poster can change when the per-asset config arrives); added D-30 (replacement for v4 `player.videojs` access) and US3 scenario 4, since it is the first break most v4 integrators will hit.

### Dilemmas — answered one by one in chat (2026-10-22)

- **D-01 feature list.** Remove Interaction areas and Shoppable (developer added Shoppable; audit had listed it as actively developed). Keep AI highlights graph, Context menu and GA plugin (recommendation was to remove them). Upcoming overlay + recommendations → one generic overlay plugin, with both built on it. Rest of the table accepted; principle "smallest possible bundle".
  - ABR: the developer wanted to keep "our hls.js ABR engine" and asked what we miss. Research (videojs.org hlsjs-video reference, `@videojs/hlsjs-video@10.2.0` typings/source on unpkg, hls.js 1.6.19 typings): the adapter takes an hls.js config passthrough (`source.engine.hlsJs`) and exposes the Hls instance (`.engine`); it pins hls.js 1.6.19 with no hook to inject our own build; it does not lazy-load hls.js (we can dynamic-import the adapter module ourselves). Our strategies are only hls.js config presets, so they fit the passthrough. Our own wrapper would lose renditions/audio menus, manifest subtitles, live/DVR, error mapping, AirPlay, native Safari fallback, and would need undocumented `@videojs/media/dom` APIs. Decision: strategies + HDR preference on the v10 adapter. Rejected: own hls.js wrapper.
  - 360: no v10 support; `videojs-vr` 2.0.0 (2023) peers on Video.js 6/7; no documented custom-rendering path. Decision: not in 5.0, track for 5.x.
- **D-02 saved configs → A.** Read as stored, one mapping table for renames (also feeds the migration guide). Server format owner: Video team.
- **D-03 hosts.** Console preview, Video Player Studio, embedded player page, SDKs/widgets, tx-builder, canvas, image-to-video and others. All consume the player as an npm dependency → no accidental v5 on release day. Each moves after GA in a planned step. Owner per product: open item for the plan (migration list).
- **D-04 v4 maintenance → B.** Security and critical fixes for 6 months after 5.0 GA (recommendation was 12).
- **D-05 framework wrappers → A.** None in 5.0; document custom-element usage.
- **D-06 CDN contract → A.** Keep main file names + global; drop .light and non-minified copies. Announce at GA only (recommendation was before GA). Risk stays: unpinned README URLs get v5 on release day.
- **D-07 start functions → keep v4 shapes.** Developer: "we must have some method that will check for server-provided configs — that's why we introduced the async method — keep it simple and elegant, improve what's possible but try to avoid breaking customer web-pages." Re-asked with code facts (`player()` fetches config → Promise, `src/utils/player-api.js:4`; `videoPlayer()` → deferred proxy, no fetch, warns on `profile`, `src/video-player.js:908`). Decision: `player()`/`players()` → Promise after server config; `videoPlayer()`/`videoPlayers()` → real player at once, no proxy, no server config (two setup paths stay). Rejected: one shared path where `videoPlayer()` also fetches config (recommended). `Cloudinary.new()` → removed in v5 (recommendation was a thin alias, since ONCALL-3380 / commit 99de7930 shows customers use it; developer accepted the break).
- **D-08 per-asset config → on, poster from video-elements.** Developer: start with the "dynamic poster" from video-elements — "a saved poster the server knows how to return for each video … that's an important concept". Research:
  - `/_applet_/video_service/` has 6 endpoints, all keyed by `{deliveryType}/{base64(publicId)}`: `video_player_profiles/{name}.json`, `video_player_config/video/…json` (video-config, `src/utils/fetch-config.js:36`), `elements/…/poster` (video-elements, opt-in `poster: true`, `video-source.js:144`, VIDEO-20110), `chapters/…vtt`, `transcription/…transcript`, `video_metadata/…json`. Five files build these URLs on their own.
  - Probe (demo cloud, 2026-10-22): `elements/upload/{b64}/poster` always answers 302 → saved poster if set (`snow_horses` → `image/upload/…/snow_horses_poster.jpg`), else the default still (`dog` → `video/upload/…/dog.jpg`); `?tx=w_400` is applied; unknown asset → 400; the 302 is `no-store` (one extra hop per load, final image cacheable). `video_player_config` for an asset with nothing saved → `{"playerOptions":{},"sourceOptions":{}}`.
  - Decision: config request stays on for `player()`; both `player()` and `videoPlayer()` use the elements poster URL by default when no explicit poster is set → poster shows at once, no flash. Video service = one core module (one URL builder) used by every feature.

### Dilemmas — continued (2026-11-08)

- **D-09 option names and attributes → A (corrected).** Keep v4 names; `cloud_name`/`cloudName` at top level or in `cloudinaryConfig`, normalized once at entry. Correction found before asking: v4 reads every `<video>` attribute (`src/utils/attributes-normalizer.js:38`), and pages rely on native ones (`controls`, `muted`, `autoplay`), so "only `data-cld-*`" would break them. Decision: `data-cld-*` + native media attributes (autoplay, muted, loop, controls, playsinline, preload, poster); `class`/`id`/`style` no longer become options.
- **D-10 URL building → A.** Own small builder in the core, v4 input format, parity proven by the 64-case set. Noted risk: must cover every v4 transformation key incl. variables and if-conditions (url-gen legacy layer handles these today).
- **D-11 options source → A.** TS types are the source; generate schema.json and option docs. Fact: schema.json is published today as `dist/schema.json` and `lib/schema.json` (`webpack/build.config.js:42`, `rollup.esm.config.js:113`), so v5 keeps publishing it. Side note: `package.json` had an unresolved merge conflict on branch fix/vtt-credentials-blob-url (developer's work, not touched).
- **D-12 events → A.** Keep documented v4 events and payloads; drop internal ones; one typed event list.
- **D-13 ads → A.** v4 parity on IMA SDK; own small IMA integration replaces `videojs-ima` + `videojs-contrib-ads` (both Video.js 8 plugins, `src/plugins/ima/ima.js:1`). Nothing beyond v4: "keep it simple, v4 parity is desired, but whatever is simple and elegant".
- **D-14 analytics → modified A.** Cloudinary analytics as v4; usage report minimized (version, cloud name, features; no titles/descriptions/URLs); GA plugin stays opt-in (D-01 overrides the "remove GA" part of option A). Data list approver: product manager.
- **D-15 default font → B.** Inter by default, self-hosted on Cloudinary (recommendation was the system font). Removes the Google third-party request; one font request per player remains.
- **D-16 secrets → A, always warn.** Verified: url-gen legacy `createCloudinaryLegacyURL` has its signing code commented out and ignores `auth_token`, so v4 never signs. Remove the options; always warn in console when passed.
- **D-17 raw-URL profiles → C.** Keep v4 behavior (any URL, any keys). Recommendation was https only + known keys. Risk accepted: a profile URL the page does not control can inject ad tags and links.
- **D-18 engines → A.** hls.js (lazy) for all HLS + dash adapter; SPF tested for VOD after 5.0; no DRM. Customers use AES HLS / TS live → hls.js can never be removed, even if SPF is added later.
- **D-19 skin → A, extended.** Developer: "keep v4 look as the default, little improvements might be welcome. anyway, alternative skins would be great". Default = ejected v10 skin restyled to the v4 look; dark/light; `colors` → CSS variables. No designer/Figma. Alternative skins: scope asked as a follow-up.
  - Follow-up: "Also offer the other v10 skins if it doesn't complicate things too much" → the other v10 skins via the `skin` option, each lazy-loaded; the plan checks the cost; if high, they move to 5.x.
- **D-20 icons → A.** v10 SVG icons + our custom SVGs; icon font removed.
- **D-21 size budget → principle.** Developer: "Keep JS bundle small and performant, keep the tiny lazy-shell with the poster-click to load". No number chosen. Fact: v4 bundlewatch caps `dist/player.min.js` (lazy entry) at 10 KB and `player-full.min.js` at 140 KB. Recorded: shell ≤ 10 KB (no regression); plan proposes core/feature budgets starting from A (≤ 60 KB / ≤ 15 KB); CI checks them.
- **D-22 repo → A.** Same repo/npm name, long-lived `v5` branch, one package with internal folders. Spec files move there.
- **D-23 build → A.** One tool, ESM-only npm build, CDN classic loader scripts (D-06 names) that load ESM chunks. No UMD/full bundle. Break accepted: CommonJS `require()` users (today `exports.require` → `dist/*.min.js`).
- **D-24 npm exports → A.** Only `.` + CSS. All aliases and `./*` removed. Host products update imports when they move (D-03).
- **D-25 tests → re-think in the plan.** Developer: "re-think our testing layer and make it adhere to modern standard and strategy, CI should be impactful and performant". Plan proposes the strategy for review. Inputs: today Vitest unit (21 files), Playwright e2e (~70 specs, v8 DOM), legacy jest/puppeteer (16 files, `npm test`). Spec parity criteria stay. No device cloud → WebView checks on own devices per RC.
- **D-26 repo rules → A.** Draft AGENTS.md "v5 branch" section + constitution for review; no change to either before approval. Until then the current AGENTS.md rules stay in force.
- **D-27 old browsers → C.** Developer: "Whatever's simpler, don't invest there". No detection/fallback code; floor documented; v4 for older browsers.
- **D-30 inner player → A, minimal.** Developer: "expose videojs as a hatch for advanced users, but don't invest or complicate stuff for that". `player.videojs` = raw v10 player (element + store); no stability promise, no v4 compat, no mapping work.
- **D-28 timeline → no date yet.** Plan estimates first. Team: the Video team. No hard deadlines known.
- **D-29 Jira epic → text approved.** Create it together with the child tasks (from the plan/task list), in ADF. Not created yet.

### Spec updated with the answers (2026-11-11)

- `spec.md` rewritten from D-01..D-30; 0 [NEEDS CLARIFICATION] markers; checklist all ticked. Existing FR numbers kept; new FR-034..FR-041 (Cloudinary.new removed, `player.videojs` hatch, attribute sources, raw-URL profiles, saved poster from video service, generic overlay, look and feel, default font). New SC-012 (saved poster first, no flash) and SC-013 (no third-party requests by default). Added a "5.0 feature list" table.
- Consistency fixes made while applying the answers (flagged to the developer):
  - FR-003 rewritten for D-07 (two return shapes) — the old text required one return shape.
  - FR-004 softened: public methods keep v4 names and call forms (D-07 principle); only the "falsy value reads instead of sets" bug is fixed. The old text ("one purpose and one return type") would have broken v4 getter/setter calls.
  - FR-030: the "validate remote configuration" part dropped (D-17 keeps v4 behavior); "no user text rendered as HTML" kept.
  - Edge case for old browsers now follows D-27 (no fallback).
- New [Assumption]: the custom element applies saved configurations like `player()`; no dilemma covered it.
- 2026-11-11 — Developer confirmed FR-003, FR-030, the old-browser edge case and the custom-element [Assumption]. FR-004 changed again: developer believes the v4 getter/setter calls (`volume()`, `currentTime()`, `width()`, `height()`, `loop()`, `controls()`, `fluid()`…) were "never really in use" — "if they add complexity or wrong in any way, we can remove them". FR-004 now: one purpose / signature / return type per method; combined getter/setters MAY be split or removed (migration guide); `source()` and the minimal-usage methods keep v4 forms. Fact: v4 `volume(0)` and `height(0)`/`width(0)` read instead of set (`if (!volume)`), `currentTime(0)` is handled.

## 4. Plan (2026-11-11)

Artifacts: `plan.md`, `research.md` (R-01..R-13, Phase 0 spikes S-1..S-7, mechanism matrix), `data-model.md`, `contracts/` (public-api, options, events, element, video-service, distribution), `quickstart.md` (Q1–Q6, S1–S21), `drafts/constitution.md` and `drafts/agents-v5-section.md` (D-26, review only, not in force). No `tasks.md`, no Jira yet.

### Research facts (checked 2026-11-11)

- Video.js 10.3.0 (2026-11-04). `@videojs/hlsjs-video` 10.3.0 pins hls.js 1.7.3. `<dash-video>` is marked "Unstable API" and lists no renditions or audio tracks.
- Size: the published figure is 25.1 KB, but the CDN bundle (player + default skin + CSS + i18n) measures ≈ 92 KB gzip; ≈ 286 KB with hls.js. SC-007 (≤ 60–70 KB) is at risk → spike S-1 runs first; > 70 KB = stop and ask.
- Skins: packaged skins use shadow DOM and cannot take new controls; ejected skins (skin.html/ts/css) can. Ejected CSS uses `@scope` (Safari 17.4, Chrome 118, Firefox 146) unless flattened → S-2.
- Captions: native `::cue` only; controls toggle `showing`/`disabled`; no custom cue markup → v4 caption styles and word highlight need our own renderer (S-3).
- Chapters: seek-bar segments only (no menu, no cue points). Thumbnails: metadata track `label="thumbnails"` with `#xywh`.
- Error dialog takes i18n keys only; apps cannot raise their own errors → own error display.
- No plugin system by design; no playlists; ads on the roadmap for "late 2026".
- Internal names re-exported from `@videojs/html` (`definePlayerFeature`, `PlayerExtension`, `defineSlice`, `extensionContext`, `mediaContext`, `createMediaAttachMixin`) are banned by lint. No internal API is planned.
- IMA SDK 3.797.1: `initialize()` must run in the user gesture; IMA's `<video>` may be found as the main media (S-4). v4 quirks to match or document: `adsInPlaylist` calls `playAdBreak()` (no-op while autoPlayAdBreaks is on); `postrollTimeout` is ignored (real wait 5 s).
- Tools: TypeScript 7.0.2 (`isolatedDeclarations`), tsdown 0.23.7 (exact pin), Vite 8 (demo only), size-limit 14.3, ts-json-schema-generator 2.9, oxlint `--type-aware` + `tsc --noEmit`, Vitest 5.1 (Node ≥ 22.12) incl. browser mode, Playwright 1.65, @axe-core/playwright 4.14.

### Decisions in the plan (R-01..R-12)

- R-01 toolchain as above; R-02 mechanism matrix (public APIs / own code / spike); R-03 event bridge + narrow FeatureContext; R-04 own ads state machine on IMA; R-05 one ejected skin restyled to the v4 look — **other v10 skins moved to 5.x** (packaged skins would silently drop our controls; FR-040 let the plan decide); R-06 generic overlay; R-07 own URL builder + parity fixtures recorded from v4; R-08 test strategy; R-09 CDN loader (IIFE → ESM chunks via `document.currentScript`); R-10 custom element; R-11 getter/setter split (proposed); R-12 size budgets. R-13 owners per host: open (D-03).
- Estimate: ≈ 38 eng-weeks ±30 % over phases 0–7. No date (D-28).
- Constitution re-check: passes, on two conditions — S-1 confirms the size budget; the developer answers the open decisions and approves dependencies.

### Open decisions (blocking `tasks.md`)

1. Video.js 8 pass-through options: keep `playbackRates`, `maxTries`, `videoTimeout`; remove the others with a debug warning.
2. `schema.json`: add `./schema.json` to `exports` (D-24 allowed only `.` + CSS).
3. `player-full.min.js`: ship as one more loader copy.
4. Getter/setters: split into named getters/setters; remove `width()`/`height()` and the run-time source-default setters.

Also pending: approval of new runtime and dev dependencies (AGENTS.md "ask first").

### Answers to the plan's open questions (2026-11-12)

- **Dependencies → approved** (runtime: Video.js 10.3.0 packages, hlsjs-video → hls.js 1.7.3, dash-video → dash.js 5.2.0, IMA at run time; dev: TypeScript 7, tsdown, Vite 8, size-limit, ts-json-schema-generator, oxlint, Vitest 5 + browser mode, Playwright, axe; removals as listed).
- **`schema.json` → add `./schema.json` to `exports`** (amends D-24); shipped in the package and on the CDN.
- **`player-full.min.js` → loader copy** at that CDN path.
- **Getter/setters → split** into named getters/setters; `width()`/`height()` and run-time source-default setters removed. Based on the FR-004 confirmation of 2026-11-11; not asked again.
- **Video.js 8 pass-through options → not decided.** Developer: "There are a lot of important stuff in that list, we need to judge them one by one according to specific ROI". Per-option facts added to `contracts/options.md`. New facts from the code:
  - The usage report already sends `playbackRates`, `maxTries`, `videoTimeout` and `videoJS`, so real use can be queried.
  - `videoJS` (in the schema) is never applied: v4 reads only `videojs`. `qualitySelector` and `ima` are never read.
  - `maxTries`/`videoTimeout` are a "not ready" watchdog (3 × 55 s), then an error.
  - `fetchErrorUsingGet` sends `Content-Range` instead of `Range`, so the GET probe is not limited to 1 byte (v4 bug).
  - `html5.hlsjsConfig` is overwritten by v4's adaptive-streaming plugin.
  - Video.js 10 has a public playback-rate button with a `rates` attribute.
- Fixes from the final review: S-1 measures the whole default player, like the budget; risks added for `@scope` vs the browser floor and for SC-008 growth; dangling "exceptions table" references in the drafts fixed; `skin` row says other v10 skins → 5.x.

### Video.js 8 options, one by one (2026-11-22)

- **`textTrackSettings` → Keep.** Developer: "that part hold important configs, we shouldn't remove it". Fact: in v4 the option turns on the Video.js 8 caption-settings dialog (text/background/window color and opacity, font size, font family, edge style; `node_modules/video.js` TextTrackSettings), off by default. v5: own accessible dialog in the captions feature, loaded only when the option is on, applied to the own renderer (S-3). Spec FR-017 and the 5.0 feature list updated; plan Phase 5 +1 week (total ≈ 39). Not decided: `persistTextTrackSettings` (Video.js 8 saves the viewer's choice in `localStorage`; the plan marks per-viewer storage out of scope).
- **Correction (2026-11-22):** miscommunication. The developer meant the `textTracks` configuration object (caption files and their `options`: theme, fontFace, fontSize, gravity, box, style, wordHighlight…), not the Video.js 8 viewer dialog. `textTracks` was already Keep. The dialog changes above were reverted (spec, plan back to ≈ 38 weeks, research, quickstart); `textTrackSettings` is back to "Proposed: Remove in 5.0, candidate for 5.x". The `persistTextTrackSettings` question is withdrawn.

### Jira target (2026-11-23)

- Developer: epic is [VIDEO-21286](https://cloudinary.atlassian.net/browse/VIDEO-21286); "the plan should go as stories under that epic, with a summary in the epic". This replaces D-29's "create a new epic".
- Epic facts (read only, 2026-11-23): summary "VideoJS v10"; status **Paused** since 2026-11-23 (reason "Change in priorities"); due date 2026-12-01; description empty, and Jira reports it as not editable for this account; one child story, [VIDEO-21287](https://cloudinary.atlassian.net/browse/VIDEO-21287) "Research videojs v10 upgrade" (Done).
- Nothing written to Jira yet.
- **2026-11-23 — Video.js 8 options decided.** Developer: "didn't we answer that in the decisions file?" Not by name, but D-09 (keep v4 names, do not break customer pages) and D-30 (no compatibility for Video.js 8 calls) cover them. Recorded as recommended: keep `playbackRates`, `maxTries`, `videoTimeout`, `fetchErrorUsingGet` (fix `Range` header); remove `videojs`, `html5`, `videoJS`, `qualitySelector`, `ima`; `disableSeekWhileScrubbingOnMobile` → behavior kept, option removed; `textTrackSettings` → 5.x candidate.
- **2026-11-23 — Jira shape.** One story per delivery phase (8 stories: spikes, foundation, core, shell + layer, skin, features, migration/docs, hardening/RC) under VIDEO-21286. Plan summary: a short comment on the epic. Epic status (Paused) and due date: leave as is.

## 5. Tasks (2026-11-23)

- `tasks.md`: 124 tasks in the plan's 8 delivery phases (one Jira story each, developer decision); 70 marked [P]; user-story labels US1 19, US2 20, US3 13, US4 8, US5 4, US6 5, US7 15, US8 3, US9 5. Tests included (spec SC-002/009/010, constitution draft VII).
- Choices made while writing: the v4 tree is deleted on `v5` in Phase 1 (T013) because the baselines are recorded in Phase 0 (T002/T003); the D-26 drafts are applied in Phase 1 (T012) after approval; `playbackRates` sits with the base UI (T080).
- `jira-draft.md`: short epic comment + 8 story texts. Nothing created in Jira yet.
- Review fixes (2026-11-23): S-1 (T004) does its own quick eject, so all spikes run in parallel; the skin is ejected unstyled in Phase 3 (T059) and restyled in Phase 4 (T076); the error display moved to Phase 3 (T070, `src/player/error-display.ts`); T013 keeps `test/fixtures/url-parity/` and `test/fixtures/v4-configs/`; new tasks for the basic player options (T066) and audio-only sources (T069); `schema.json` is committed at the repository root, because `dist/` is git-ignored, and copied to `dist/schema.json` by the build; every FR and every Keep option in `contracts/options.md` is now named by at least one task; the core takes width, DPR and HDR support as inputs (T033) and the layer measures them (T066); the schema drift check runs from Phase 1 on a stub (T023); S20 runs once, in T117; Phase 3 and 4 estimates stay at 5 and 4 weeks (the eject and the error display move with their effort; the new options and audio tasks fit inside ±30 %); tasks renumbered; `plan.md` tree adds `shell/poster.ts` and `player/error-display.ts`; `research.md` S-7 adds the touch-seek check.

## 6. Test plan (2026-11-23)

- Developer: "did we put anything there regarding the test plan - I think our current testing strategy in the player is very weak and I would like to improve it a lot. keep industry best standards, I want it performant and cost-effective and keep the netlify deploy-preview or something similar (example pages), though their structure can be improved much as well as the way our E2E tests are using it".
- Found: R-08 was marked "Decided", but D-25 asked for a proposal for review, and no review is recorded. R-08 also said "no deploy preview", which conflicts with the developer's ask. R-08 is reopened as "Proposed".
- v4 facts (2026-11-23): 34 ESM + 36 non-ESM e2e specs share `commonSpecs`; 44 + 44 copied demo pages (`docs/`, `docs/es-modules/`); non-ESM specs run on the webpack dev server; ESM specs run on the Netlify preview (`cld-vp-esm-pages`), with a setup test that polls up to 120 s; Netlify builds the player again in `docs/es-modules` `prepare`; tests navigate by clicking the index; a 5 s race with `networkidle` acts as a fixed wait; `retries: 2`; Chrome only; 19 of the last 100 `e2e_pr.yml` runs failed; runs take 5–8 min; reports are pushed per run to `cloudinary-video-player-reports` through `cpina/github-action-push-to-another-repository@main`; 1 of the last 60 PRs came from a fork.
- Wrote `test-plan.md` (proposal): layers incl. type tests, package-consumer tests, publint/attw, live nightly suite, preview smoke; `examples/` with one definition per example and three delivery modes; hermetic media through the delivery prefix and a local fixture server; build once, test the artifact, deploy the same files to Netlify; flaky-test policy; CI graph with cancel-in-progress and path filters; reports as artifacts. Phase 1 grows 2 → 4 weeks; total ≈ 40.
- On hold until the developer answers: `tasks.md` renumbering and `jira-draft.md`. Nothing created in Jira.
- **Developer answers (2026-11-23):** full e2e on the local built artifact, preview for people + smoke → as recommended. Media → **live Cloudinary always** (not local fixtures). Preview build → **as today with v4** (Netlify builds; CI upload recorded as a future alternative). Reports repository → **keep the current behaviour**, artifacts-only recorded as a future alternative.
- Applied: `test-plan.md` approved with these changes (fixture server and media recorder dropped; `test/e2e/assets.ts` lists live assets; failed-request summary tells outages from bugs; preview smoke waits for `build-info.json` with the PR head commit, because v4's link check can pass on an old deploy; second Netlify site for v5 recommended, ask first; nightly contract check of video-service responses against the unit-test mocks). R-08 replaced by a summary. `plan.md`: testing line, scripts (`build:examples`, `test:types`, `test:consumers`, `test:e2e:preview`), `examples/` in the tree, Phase 1 2 → 3.5, total ≈ 40. `quickstart.md`: Q7–Q9 and the example-page note. `tasks.md`: 134 tasks (78 [P]); Phase 1 adds the examples site, `examplePage` fixture, consumers, `lint:package`, Netlify config + preview smoke, walking skeleton; type tests in Phases 2–3; registry and contract checks in Phase 5. `jira-draft.md`: ranges, story 2, one epic-comment line on testing.
- Still needs a yes: dev dependencies `publint` and `@arethetypeswrong/cli`; Netlify site for v5 (second site recommended). [SUGGESTION] pin the reports-push action to a commit SHA.
- Note: task IDs in log entries before this one use the 124-task numbering; `tasks.md` now has 134 tasks.
- Status correction: only the four §11 answers are decisions. The rest of `test-plan.md` (layers, coverage threshold, required checks, Slack alert, `examples/` move, +1.5 weeks) awaits review. PR e2e uses branded Chrome (live `demo` media needs H.264/AAC); the walking skeleton proves one live HLS asset decodes. Risks for live media and Netlify-built previews added to `plan.md`. Story 2 now depends on a Netlify site for v5.
- Remaining answers (2026-11-23): `publint` and `@arethetypeswrong/cli` — "ok if you find them safe" (checked on the public registry: MIT, active maintainers, npm provenance, no install scripts, ~3 M and ~1.9 M weekly downloads; `attw` nests its own TypeScript 5.6); Netlify — "keep using the current one"; extra layers — "do we need extra layers? I'd rather keep it compact"; gates — "no coverage, only confidence"; CI rules — "KISS"; example pages — "One page + presets".
- Applied: `test-plan.md` rewritten as the compact plan, status Decided. Layers: static checks (incl. `lint:package`), unit, browser, end-to-end, preview smoke; release checks for TTFF and WebViews. Removed: type tests, consumer apps, visual regression, contract check, coverage threshold, mutation testing, playground, Slack alert, path filters, build-once artifact graph. Examples: `examples/index.html`, `examples/player.html?preset=<id>&delivery=cdn|npm|element`, `examples/presets/*.ts`. Netlify: `docs/es-modules/netlify.toml` on `v5` builds the preview on the current site (base directory to confirm in Phase 1); T121 keeps it. CI: four PR jobs (checks, browser, e2e, preview), each builds; cancel on new push.
- `tasks.md`: 134 → 130 tasks (removed consumers, two type-test tasks, contract check; the consumers task became `test/unit/node-import.test.ts`); renumbered; Phase 1 3.5 → 3 eng-weeks; total ≈ 39. `plan.md`, `quickstart.md` (Q7 `lint:package`, Q8 preview smoke), `research.md` R-08 (Decided) and `jira-draft.md` updated. The developer approved `jira-draft.md` ("lgtm"); IDs in this log before this entry use the older numbering.
- Jira created (2026-11-23), parent epic VIDEO-21286 (status Paused and due date not changed): VIDEO-21418 Spikes, VIDEO-21419 Foundation, VIDEO-21420 Core, VIDEO-21421 Shell + layer, VIDEO-21422 Skin and base UI, VIDEO-21423 Features, VIDEO-21424 Migration and docs, VIDEO-21425 Hardening and RC; plan comment on the epic (comment 562807). Descriptions are HTML → ADF with a task list per story. Jira renders them through the wiki renderer, so some code spans were reworded (glob paths with two `*`, braces, brackets, pipes, `--color-*`, `CustomEvent`s); every story was checked through `renderedFields`; the meaning is the same as `tasks.md`.

## 7. Phase 0 spikes (2026-11-26, story VIDEO-21418)

- Branch `VIDEO-21418-v5-spikes` (stacked on `v5`). Spikes ran on **Video.js 10.7.0** (latest on npm on 2026-11-26; hls.js 1.7.4, dash.js 5.2.0); S-1 also ran on **10.3.0**. The plan pin stays **10.3.0** until the developer decides (registry skins and several fixes exist only in 10.7.0). Engines: headless Playwright 1.60 (Chromium 148, Firefox 150, WebKit 26.4). Floor engines (Safari 16.4, Chrome 111, Firefox 121) and real iPhones were not available: those rows say "not verified here" and go to the device checklist in the PR.
- Baselines: `test/fixtures/url-parity/` (T002: 92 source, 22 player, 9 config cases, recorded from the v4 code at master `61d0b53c` in jsdom) and `test/fixtures/v4-configs/` (T003: 81 player samples from `docs/*.html` and the embed iframe, the four built-in profiles from `cloudinary-video-player-profiles@1.3.0`, the v4 defaults, two real saved config responses from the `prod` cloud). No non-empty per-asset config was found for the demo assets.

| Spike | Result | Key numbers | Detail |
|---|---|---|---|
| S-1 size | **Go with a plan note** for design B (feature menus load with their feature chunk); **no** for design A (all menus in the first load) | B: 62.6 KB (10.7.0), 57.7 KB (10.3.0); A: 79.3 / 74.7 KB; packaged skins 77–82 KB; hls.js chunk 204 KB | `spikes/s1-size/README.md` |
| S-2 skin | **Eject Compat, flatten `@scope` and `&`** (neither registry skin meets the floor as fetched); own control and overlay work | Compat CSS 9.0 KB gzip, Default 10.5 KB; flatten +0.2 KB; 6/6 engine runs | `spikes/s2-skin/README.md` |
| S-3 captions | **Yes**: own renderer on `hidden` tracks with v4 styles and word highlight; own menu, button, hotkey and state are needed (built-ins treat `hidden` as off) | 14/14 seek checks × 3 engines; highlight delay median 1–24 ms (WebKit first cue up to 251 ms) | `spikes/s3-captions/README.md` |
| S-4 IMA | **Yes on desktop**: IMA container in a shadow root keeps `store.target.media` on our content; pre-roll → content in 3 engines. iPhone not verified here | v4 `adsInPlaylist`: no effect; v4 `postrollTimeout`: ignored (5000 ms always) | `spikes/s4-ima/README.md` |
| S-5 DASH | **Split**: quality menu built in (10.7.0); audio menu through an own ~20-line bridge on documented APIs; ABR presets through `source.engine.dashJs` | 6 renditions (180p 104 kbps … 1080p 2678 kbps); audio switch 0.75–1.3 s | `spikes/s5-dash/README.md` |
| S-6 build | **Yes** for IIFE native `import()`, cross-origin `defer`/`async` (12/12), loader mechanism 126 B gzip, TS 7 + schema generator (separate tsconfig), oxlint ring rules. Per-chunk CSS: **own plugin** (tsdown needs `@tsdown/css`, a new package; plain Rolldown no longer bundles CSS) | jsDelivr and unpkg send `access-control-allow-origin: *` | `spikes/s6-build/README.md` |
| S-7 media | **Yes**: the integrator's `<video>` is the media for native and `<hlsjs-video>` and keeps its identity through MP4 → HLS → MP4; overlay layer drives upcoming and end screen. **Touch: Video.js 10 seeks while dragging** | 8 moves → 8 seeks; `change-throttle` cuts it to 2 | `spikes/s7-media/README.md` |

- Facts that change how later tasks are done (no task text changed yet):
  - Define the player element **before** `<media-container>`, or the container never registers and fullscreen loses the overlays (S-3; seen on 10.3.0 and 10.7.0).
  - With hls.js, a `hidden` subtitle track gets no cues; the layer sets `engine.subtitleTrack` itself (S-3).
  - The ad layer must keep IMA's container in a shadow root; ads need https pages in local dev and e2e (S-4). The iOS note in R-04 is reversed: IMA's default plays the ad **in** the content element, so v5 ignores `ended` during an ad (S-4).
  - A DASH quality pin goes through the store only; a pin made on the engine leaves "Auto" broken (S-5). Never `import 'dashjs'` while v4 is installed: it resolves to v4's 4.7.4 (S-5).
  - The ring-rule ban list also needs `defineSlice` from `@videojs/store`; oxlint overrides replace base options, so the list repeats per override (S-6). `ts-json-schema-generator` uses the root `typescript` 5.9 as a peer, so v5 keeps two TypeScript packages (S-6).
  - A `<video>` inside `<hlsjs-video>` needs one own size rule; a click on an end-screen background reaches the skin's tap gesture unless the overlay stops it; Firefox with `preferPlayback: 'native'` does not fall back to hls.js (S-7).
- Budgets (T011): the hls.js adapter chunk is **204 KB** gzip (hls.js 1.7.4 alone 174 KB; the light build, 111 KB, has no alternate audio). The plan's "≤ v4 (162 KB)" cannot be met with full hls.js. Recorded in `plan.md` as pending; the developer decides the number.
- Incident: a stray `pnpm start` ran during the spikes. It ran a pnpm install in the checkout (pnpm layout in `node_modules`, untracked `pnpm-lock.yaml`, `videojs-ima` 2.5.0 → 2.6.0) and a failing webpack start. All spike packages still resolve; both recorders were re-run afterwards and give the same fixtures. `pnpm-lock.yaml` is not committed.
- Questions for the developer (asked once, after the story 1 PR): S-1 design B and the hls.js budget; the Video.js pin (10.3.0 vs 10.7.0); approval of the D-26 drafts (T012); S-2 flatten at build time (postcss and postcss-selector-parser as devDependencies) or once at eject; S-5 DASH (accept the "Unstable API" element, presets for DASH or HLS only); S-6 per-chunk CSS (own plugin or `@tsdown/css`); S-7 touch seek (accept, throttle, or own logic for `disableSeekWhileScrubbingOnMobile`); S-4 parity for `adsInPlaylist` and `postrollTimeout`; the Netlify base directory; real saved and per-asset config samples for `test/fixtures/v4-configs/saved/`.

## 8. Spike decisions (2026-11-26)

The developer answered the §7 questions the same day.

| # | Question | Decision |
|---|---|---|
| 1 | Video.js pin | **10.7.0** (was 10.3.0). `plan.md` dependencies and approvals updated. |
| 2 | hls.js chunk budget | **≤ 205 KB** with full hls.js (alternate audio kept for v4 parity). The light build was rejected. |
| 3 | Per-chunk CSS | **`@tsdown/css`** (new dev dependency, exact pin). The own plugin from S-6 stays as the Rolldown fallback. |
| 4 | D-26 drafts | **Approved as written.** T012 applies them on `v5`. |
| 5 | Netlify | "We need to test the CDN build and the ESM build, do what makes sense and enables that." T025 keeps both delivery modes testable on the previews (`?delivery=cdn` loads the IIFE loader from `dist/`, `?delivery=npm` the ESM build). Site settings stay ask-first. |
| 6 | First load (S-1) | **Design B**: feature menus load with their feature chunk. |
| 7 | Skin (S-2) | **Compat, flattened once at eject.** No postcss dependencies. |
| 8 | DASH (S-5) | **Accept `<dash-video>`**, add the own audio bridge, ABR presets for **HLS only** (as v4). |
| 9 | IMA parity (S-4) | `adsInPlaylist`: **v4 behavior** (ads requested once per page); a per-item fix is recorded as a future option. `postrollTimeout`: **honored** (default 5000 ms = v4). |
| 10 | iOS ads (S-4) | **Keep the IMA default** (`disableCustomPlaybackForIOS10Plus = false`): the ad plays in the content element; v5 ignores `ended` during an ad. |
| 11 | Touch seek (S-7) | **Accept Video.js 10**: seek while dragging. `disableSeekWhileScrubbingOnMobile` and its behavior go; the migration guide lists it as a behavior change. `contracts/options.md` and `plan.md` updated. |
| 12 | Saved config samples | Skipped for now; `test/fixtures/v4-configs/saved/` keeps the two samples. |

## 9. Phase 1 notes (2026-11-26, story VIDEO-21419)

- **Per-chunk CSS**: `@tsdown/css` 0.23.7 with `css.splitting: true` writes one CSS file per lazy chunk, named after the chunk (`chunks/a-<hash>.js` + `chunks/a-<hash>.css`; evidence in `spikes/s6-build/tsdown-css/`). The JS does not load its CSS: the layer loads it from `import.meta.url` (Phase 3). The IIFE build needs `css.fileName: 'player.min.css'` (the default name is `style.css`).
- **TypeScript**: one direct `typescript` (7.0.2). `ts-json-schema-generator` 2.10.0 lists `typescript >=5.9 <7` as a plain dependency, so npm nests TypeScript 6.0.3 under it; no alias is needed (this replaces the S-6 note about two root packages). TypeScript 7 has no JS API, so the `.d.ts` step runs through tsdown (oxc) with `isolatedDeclarations`. `isolatedDeclarations` is on for `src/` only (`tsconfig.build.json`); config files, tests and examples use `tsconfig.json`. `npm run typecheck` checks both.
- **Lint**: oxlint runs without `--type-aware` (it needs `oxlint-tsgolint`, which is not approved). The ring rules, the `@internal` ban and the `innerHTML`/`outerHTML` ban work without it. The v4 recorders in `scripts/url-parity/` and `scripts/v4-configs/` are not linted (they run only on a v4 tree).
- **Package checks**: `attw` cannot resolve a CSS subpath, so `lint:package` excludes `./cld-video-player.min.css`.
- **WebKit, local**: Playwright 1.65 ships a frozen WebKit for macOS 14 that fails to start (`Unknown setting: PushAPIEnabled`). WebKit e2e is not verified on this machine; CI runs it on Linux (PR, `@smoke`) and macOS (nightly).
- **Preview smoke, local dry run**: Chrome blocks a public origin from loading loopback resources (Local Network Access). When `PREVIEW_URL` is a localhost URL, the `preview` project adds `--disable-features=LocalNetworkAccessChecks`; real Netlify previews do not need it.
- **Netlify**: both sites build from repository files on v5 branches, not from the site settings: `docs/es-modules/netlify.toml` (`cld-vp-esm-pages`, base `docs/es-modules`; builds the player and `examples/`, publishes them with `build-info.json`) and the root `netlify.toml` (`cld-video-player`, base assumed to be the repository root). The site settings are unchanged. `?delivery=cdn` tests the IIFE loader from `dist/`, `?delivery=npm` the ESM build.
- **Nightly**: GitHub runs `schedule` only from the default branch. `v5-nightly.yml` runs by hand (`workflow_dispatch`) until a copy is on `master` (ask first) or v5 is the default branch.
- **Not changed yet**: `release.yml`, `deprecate.yml` and `purge-jsdelivr.yml` still call the v4 `build-all`; no task covers them yet. They must change before T130 publishes 5.0.0-rc.0. The v4 `docs/` pages stay until Phase 6.
