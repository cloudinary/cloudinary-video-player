# Jira draft — approved and created 2026-11-23

Created: stories 1–8 = [VIDEO-21418](https://cloudinary.atlassian.net/browse/VIDEO-21418) … [VIDEO-21425](https://cloudinary.atlassian.net/browse/VIDEO-21425) (in order); the epic comment is on [VIDEO-21286](https://cloudinary.atlassian.net/browse/VIDEO-21286).

Target: epic [VIDEO-21286](https://cloudinary.atlassian.net/browse/VIDEO-21286) ("VideoJS v10"). Epic status (Paused) and due date stay as they are. Everything below is converted to ADF when created.

## Comment on the epic (short plan summary)

> **v5 plan — rewrite on Video.js 10**
> - Rebuild the player in TypeScript on Video.js 10. Cloudinary logic lives in a core with no Video.js code; first load stays ≤ 10 KB.
> - v4 options, factory functions, CDN file names and `window.cloudinary` keep working. Every break is in a migration guide and reported in debug mode.
> - New test strategy, compact: unit, real-browser and end-to-end tests on the built files; one example page with presets that end-to-end tests and the Netlify preview share; three engines nightly.
> - 8 stories below, one per phase. Estimate ≈ 39 eng-weeks (±30 %).
> - Main risk: the Video.js 10 default bundle measures ≈ 92 KB gzip against a 60–70 KB budget. Spike S-1 decides before Phase 1.
> - Spec, plan and tasks: `specs/001-v5-videojs10-rewrite/` (moves to the `v5` branch in the first task).

## Stories (issue type Story, parent VIDEO-21286)

Each description has: goal, exit criteria, estimate, depends on, and the phase's tasks from `tasks.md` as a checklist (ADF task list).

| # | Summary | Goal | Exit | Estimate | Depends on | Tasks |
|---|---|---|---|---|---|---|
| 1 | v5 · Spikes and v4 baselines | Prove the risky parts (size, skin, captions, IMA, DASH, build/CDN, media element) and record v4 URL and config baselines. | Each spike has a yes/no and a sketch; S-1 ≤ 70 KB or a developer decision. | 3 eng-weeks | — | T001–T011 (11) |
| 2 | v5 · Foundation: toolchain, CI and test pipeline | Empty v5 package that builds, lints, tests and checks size in CI; test pipeline, `examples/` presets and Netlify preview smoke. | Empty shell builds; CI green; one preset passes build → e2e → Netlify preview → smoke. | 3 | Story 1; approval of the AGENTS.md/constitution drafts; v5 Netlify config on the current site | T012–T028 (17) |
| 3 | v5 · Core: options, URLs, video service | All Cloudinary logic without Video.js: options + schema, renames, URL builder, sources, video service, tracks, events, errors. | URL parity with v4 (SC-002); schema generated. | 4 | Story 2 | T029–T052 (24) |
| 4 | v5 · Shell and Video.js 10 layer | Minimal embed plays from CDN and npm: factories, `<cld-video-player>`, lazy, schedule, saved poster, unstyled ejected skin, basic options, adapters, audio-only, event bridge, error display. | US1, US2, US8 scenarios pass. | 5 | Story 3 | T053–T080 (28) |
| 5 | v5 · Skin (v4 look) and base UI | Ejected Video.js 10 skin restyled to v4 dark/light; base controls; accessibility. | Zero WCAG 2.2 AA violations on the default skin; CSS ≤ 12 KB. | 4 | Story 4 | T081–T092 (12) |
| 6 | v5 · Features | Captions, chapters, thumbnails, graph, overlay, playlist + widget + upcoming + recommendations, ads, download, source switcher, floating, autoplay on scroll, analytics. | US4–US7, US9 scenarios pass. | 14 | Story 4; UI parts after Story 5 | T093–T115 (23) |
| 7 | v5 · Migration guide and docs | Migration guide, option reference, README, v4 config sample run. | ≥ 90 % of v4 samples run unchanged (SC-004); migration < 30 min (SC-005). | 3 | Story 6 | T116–T121 (6) |
| 8 | v5 · Hardening and release candidate | Leak, host, TTFF, audit and line-count checks; full matrix; WebView checks; `5.0.0-rc.0`. | All success criteria pass; first internal host on the RC. | 3 | Story 7 | T122–T130 (9) |
