# Quickstart: validating v5

Runnable checks that prove the spec's user stories and success criteria. Contracts and data shapes are in `contracts/` and `data-model.md`; this file only says how to check them.

## Prerequisites

- `v5` branch checked out; Node version from `.nvmrc`.
- `npm ci`
- `npx playwright install --with-deps chromium webkit firefox` (once per machine).
- Script names below are defined in `plan.md` → "Scripts".

```bash
npm run build          # dist/: loader scripts, ESM chunks, CSS, schema.json, d.ts
npm run dev            # example presets at http://localhost:5173 (examples/)
```

## Fast checks (every pull request)

| # | Command | Proves | Pass when |
|---|---|---|---|
| Q1 | `npm run typecheck && npm run lint` | One typed contract (FR-004, FR-007) | No errors. |
| Q2 | `npm run test:unit` | Core logic: options, renames, URL builder, video service, playlist state | All pass. |
| Q3 | `npm run test:unit -- url-parity` | SC-002, FR-011 | Every golden fixture recorded from v4 matches, or is listed in `test/fixtures/url-parity/intentional-changes.json`. |
| Q4 | `npm run test:browser` | Shell, layer and features in a real browser (FR-003, FR-005, FR-009, FR-018, FR-023) | All pass (Chromium on PRs; all three engines nightly: `npm run test:browser -- --browser.name=webkit` etc.). |
| Q5 | `npm run size` | FR-032, SC-007 | Every entry and chunk within its budget (`plan.md` → "Size budgets"). |
| Q6 | `npm run test:e2e:smoke` | SC-001, SC-009 smoke | Full set on branded Chrome and `@smoke` on Firefox and WebKit pass; axe finds no WCAG 2.2 AA violation on the default skin. |
| Q7 | `npm run lint:package` | FR-031, package `exports` and types | `publint` and `@arethetypeswrong/cli` report no problem. |
| Q8 | `npm run test:e2e:preview` | R-09 on real hosting | On the Netlify preview of this commit: the loader loads from another origin, chunks and CSS load, two presets play. |

## Scenario checks (end-to-end, before each release)

Run `npm run test:e2e` (full suite) or open the preset in `npm run dev` to check by hand. A page name below (for example `minimal-v4.html`) means `player.html?preset=minimal-v4`; add `&delivery=npm` or `&delivery=element` for the other delivery modes (`test-plan.md` §4).

| # | Story | Demo page | Steps | Expected |
|---|---|---|---|---|
| S1 | US1-1 | `minimal-v4.html` | Load the v4 README snippet with the v5 CDN files. Press play. | Saved poster, then playback. No console errors. |
| S2 | US1-2 | `minimal-v4.html` with `&delivery=element` | `<cld-video-player cloud-name="demo" public-id="cld-sample-video">` | Same as S1. |
| S3 | US1-4 | `api.html` | Call `source()` and `play()` on the returned object in the same task as `videoPlayer()`. | Both take effect after ready. |
| S4 | US2-2 | `api.html` | `source(a, { transformation })` then `source(b)`. | `b`'s URLs carry no part of `a`'s transformation, cloud config or query params. |
| S5 | US2-6, SC-012 | `poster.html` | Asset with a saved poster, no `poster` option; throttle the network. | First poster painted is the saved poster; it never changes after the config arrives. |
| S6 | US2-7 | `adaptive-streaming.html` | AES-128 HLS sample; live TS sample. | Both play; quality and audio menus list the stream's options. |
| S7 | US3-2/3 | `profiles.html` | v4 config sample set (`test/fixtures/v4-configs/`) with `debug: true`. | ≥ 90 % run unchanged; every other one logs a message that names the fix (SC-004). |
| S8 | US3-4 | `profiles.html` | `await cloudinary.player('id', { profile: 'my-profile' })`. | Resolves to the player after the profile applies. |
| S9 | US4-1/2 | `captions.html` | VTT, SRT, transcript (one still generating); iOS fullscreen. | Every track listed and shown; the pending transcript appears once ready. |
| S10 | US4-4, SC-009 | every demo | Keyboard only; axe scan in each skin. | Every control reachable with visible focus and a name; zero AA violations. |
| S11 | US5-1/2/3 | `ads.html` | VAST pre-roll; blocked IMA script; playlist with `adsInPlaylist`. | Pre-roll then content; with the block, content plays with no error; ads per item as v4. |
| S12 | US6-1/2 | `playlist.html` | Call `playNext()` before the playlist loads; let a video end. | Call applies once loaded; upcoming overlay shows; next video starts. |
| S13 | US7-3 | `overlay.html` | `addOverlay({ trigger: { at: 3 } })`; press `Escape`; change source. | Shows at 3 s, keyboard-operable, closes, removed on source change. |
| S14 | US8-1 | `lazy-player.html` | Load with `lazy: true`; inspect network. | Only the loader script, CSS and poster load before interaction. |
| S15 | US8-2 | `schedule.html` | Window opens 30 s after page load. | Player becomes available without reload. |
| S16 | US8-3, FR-026 | `multiple-players.html` | Three players, different options. | No option or state crosses between them. |
| S17 | US9-1/2 | `api.html` | Listen to every public event right after creation. | `playerload`, `ready`, `videoload` received; each milestone fires once per playback. |
| S18 | US9-3 | `api.html` | Inspect the usage-report request. | Payload has only version, cloud name and features. |
| S19 | SC-010 | `dispose.html` | 100 create/dispose cycles (automated). | No listeners, timers, observers or added elements remain. |
| S20 | SC-013 | `minimal-v4.html` | Default options; record all requests. | Only Cloudinary hosts and the page's host. |
| S21 | SC-006 | `minimal-v4.html` | Compare time to first frame, v4 vs v5, same page and network (`npm run bench:ttff`). | v5 ≤ v4. |

## WebView checks (release candidates, team devices)

On an iPhone (WKWebView test app) and an Android phone (System WebView test app), run S1, S2, S6, S9 and S11, and record the result per device in the release checklist. Autoplay and fullscreen differences are documented, not worked around (spec assumption).
