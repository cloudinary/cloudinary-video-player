# v5 test plan

**Status**: Decided 2026-11-23 (section 10). It replaces the R-08 draft in `research.md`; its tasks are in `tasks.md`.

**Fixed inputs (D-25, not reopened)**: the spec's parity criteria (64 URL cases, schedule, poster, breakpoints, 19 validator cases) stay. The jest/puppeteer suite goes. WebView checks run on the team's own devices for each release candidate (no device cloud).

**Developer input (2026-11-23)**: "our current testing strategy in the player is very weak and I would like to improve it a lot"; industry standards; performant and cost-effective; keep the Netlify deploy preview with example pages; improve their structure and the way end-to-end tests use them. Then: "I'd rather keep it compact", "no coverage, only confidence", "KISS".

---

## 1. v4 today

| Area | Finding | Evidence |
|---|---|---|
| End-to-end depth | ~70 specs; most check only that a video plays (`video.paused`). | `test/e2e/specs/commonSpecs/*VideoPlaying.ts`; audit I |
| Duplication | Each page has two specs (`ESM/` 34, `NonESM/` 36) that call the same `commonSpecs` function. The demo pages are also copied twice: 44 in `docs/*.html`, 44 in `docs/es-modules/*.html`. | `test/e2e/specs/`, `docs/`, `docs/es-modules/` |
| Wrong artifact | Non-ESM specs run against the webpack dev server (`npm run start`), not the built `dist/` files that customers load. | `test/e2e/playwright.config.ts` → `webServer` |
| Deploy coupling | ESM specs run against the Netlify deploy preview. A setup test polls the preview for up to 120 s, and only for a link, so it can pass on the previous commit's deploy. | `specs/Setup/global.setup.ts` |
| Navigation | Each test opens the index page and clicks a link, so every test also depends on the index page. | `fixtures/vpTest.ts` (`mainPage.goto()` in an auto fixture) |
| Waits | `waitForPageToLoadWithTimeout` races `networkidle` against a fixed 5 s timer. On video pages `networkidle` does not settle, so it is a fixed 5 s wait. | `src/helpers/waitForPageToLoadWithTimeout.ts` (its own comment) |
| Selectors | 64 references to the internal `<id>_html5_api` element. | `grep -rn _html5_api test/e2e` |
| Flakiness | `retries: 2` on CI hides flaky tests. 19 of the last 100 `e2e_pr.yml` runs failed. | `playwright.config.ts`; `gh run list` (2026-11-23) |
| Engines | Chrome only. | `playwright.config.ts` projects |
| Failures | A failed media request looks the same as a player bug in the report. | all specs |
| Unit tests | Vitest in jsdom, ~141 cases; jsdom has no media playback and no layout, so player-level tests prove little. | audit I |
| Run time | 5–8 min per PR for Chrome-only smoke tests. | `gh run list --workflow e2e_pr.yml` |

---

## 2. Principles

1. **Confidence, not coverage.** Each test protects a user-visible behavior, a spec criterion or a fixed bug. No coverage gates or reports.
2. **Lowest layer that can prove it.** Pure logic in Node; DOM and media in a real browser; whole pages only for user journeys.
3. **Test the shipped artifact.** End-to-end tests load the built `dist/` the way customers do: classic script, npm import, custom element.
4. **Live media.** End-to-end tests use real Cloudinary delivery and the video service (developer decision). Every test asset is listed once in `test/e2e/assets.ts`.
5. **No fixed waits.** Web-first assertions, `expect.poll` and player events only. CI rejects `waitForTimeout` and `networkidle` in `test/`.
6. **User-facing locators and the public API.** Roles, labels and `player.*` calls; never Video.js internal markup.
7. **Fast PRs.** Target ≤ 10 min, not counting the preview smoke, which waits for Netlify's build.

---

## 3. Layers

Three test layers, plus checks that need no test code.

| Layer | Proves | Tool | Every PR | Nightly | Release |
|---|---|---|---|---|---|
| Checks | Types, ring rules, schema drift, size budgets (FR-032), package `exports` and types resolve for every condition | `tsc`, oxlint, schema drift, size-limit, `publint` + `@arethetypeswrong/cli` | ✓ | | |
| Unit | `src/core`: options, renames, URL builder + parity fixtures (SC-002), video service (fetch mocked), tracks, playlist state, milestones, errors; the built npm entry imports in Node without a DOM | Vitest, Node | ✓ | | |
| Browser | Shell queue, element, lazy/schedule, layer, event bridge, each feature's `setup`/`teardown`, leaks (SC-010) | Vitest browser mode | Chromium | Three engines | |
| End-to-end | User journeys on the example presets with live `demo` assets (quickstart S1–S20), accessibility with axe and keyboard (SC-009), the deployed preview from another origin (R-09) | Playwright | Branded Chrome full (H.264/AAC, as v4); Firefox and WebKit `@smoke`; preview smoke | Three engines full (WebKit on macOS) | |
| Release checks | Time to first frame v4 vs v5 (SC-006); iPhone and Android WebViews (S1, S2, S6, S9, S11) | `bench:ttff`; own devices | | | ✓ |

**Why no more layers.** Public types are generated from the source, so they cannot drift from it (audit C); the presets are TypeScript that uses those types, so `tsc` checks them as a customer would. The `npm` delivery mode imports the package by name through its `exports`, so the end-to-end tests are also the consumer test. Live media in end-to-end tests already calls the real video service, so a separate contract check adds little.

---

## 4. Example pages: one page and presets

**Today**: two hand-copied sets of 44 pages, a hand-written link list in the tests, and Netlify builds the player again.

```text
examples/
├── index.html          # presets grouped by feature (generated from presets/)
├── player.html         # renders one preset: ?preset=<id>&delivery=cdn|npm|element
├── presets/            # basics.ts, streaming.ts, captions.ts, playlist.ts, ads.ts, …
└── vite.config.ts
```

- **A preset is data.** `{ id, title, feature, players: [{ options, setup? }], layout? }`. More than one player is allowed (S16); `layout: 'scroll'` gives space for lazy loading, autoplay on scroll and floating.
- **One page, three modes.** `player.html` renders the preset as `?delivery=cdn` (default: classic `<script>` + `cloudinary.videoPlayer`), `?delivery=npm` (ESM import by package name) or `?delivery=element` (`<cld-video-player>`).
- **The page shows the code it runs.** A code panel prints the snippet for the selected mode, generated from the same options, with a copy button.
- **Stable test contract.** The page sets `window.examples = { players, ready }` (examples only, never in the library). Each player is a region named by the preset title.
- **Built from the artifact.** In CI and on Netlify the page loads the built `dist/`. `npm run dev` loads `src/` through Vite.
- **SC-003.** Every v4 demo page for a kept feature has a preset; a unit test over `presets/` checks that every kept feature has one.

---

## 5. How end-to-end tests use the presets

- **Direct URLs.** `page.goto('/player.html?preset=chapters-vtt&delivery=npm')`. No index clicks, no global setup.
- **One fixture, `examplePage`.** It opens a preset, waits for `window.examples.ready`, fails on console errors not on an allow list, records every request, lists failed media and video-service requests in the report (so an outage is easy to tell from a bug) and runs axe on demand.
- **Delivery modes.** Every scenario runs in `cdn` mode. The `@smoke` cases also run in `npm` and `element` modes.
- **Network control only where a scenario needs it.** `page.route` blocks the IMA script (S11) or delays the poster (S5, SC-012). The v4-config test (SC-004) passes each sample to `player.html` with an init script. Nothing else is mocked.
- **Hosts.** The request log proves S20 (SC-013).
- **Timeouts and retries.** Test 30 s, assertion 5 s. `retries: 1` on CI, 0 locally. A test that passes only on retry shows as flaky in the report; it is fixed, or skipped with a ticket.

---

## 6. Deploy preview

The current Netlify site (`cld-vp-esm-pages`) stays (developer decision).

- **Netlify builds the preview, as in v4.** The site reads `docs/es-modules/netlify.toml` (the only `netlify.toml`; the base directory is a site setting, to confirm in Phase 1), and `docs/es-modules/package.json` builds the player in its `prepare` script. On `v5` these files build the player and `examples/` with the CI scripts and writes `build-info.json` with Netlify's `COMMIT_REF`. On `master` it stays as it is, so v4 previews keep working.
- **Preview smoke.** A PR job waits until the preview's `build-info.json` shows the PR's head commit (timeout 10 min), then loads `player.min.js` from the preview into a page on another origin (CORS, chunk and CSS loading) and plays two presets.
- **Branch deploy.** The `v5` branch deploy gives internal hosts the latest build.
- **Future alternative.** CI builds once and uploads the tested files with `netlify deploy`. It saves the second build and the wait, but needs Netlify secrets in GitHub.

---

## 7. CI

**PR workflow (`v5-pr.yml`)**: four parallel jobs. Each runs `npm ci` and `npm run build` itself; the build takes seconds, so no artifacts pass between jobs.

| Job | Runs |
|---|---|
| `checks` | typecheck, lint, `lint:package`, size, schema drift, unit |
| `browser` | Browser tests, Chromium |
| `e2e` | Branded Chrome full; Firefox and WebKit `@smoke` |
| `preview` | Waits for Netlify's deploy of this commit, then the preview smoke |

- A new push cancels the PR's running workflow (`concurrency` with `cancel-in-progress`).
- The four jobs must pass to merge into `v5`.

**Nightly workflow (`v5-nightly.yml`)**: browser tests and full end-to-end tests on three engines (WebKit on macOS). GitHub's own failure notice is the alert.

**Reports**: as in v4 (developer decision): the HTML report is uploaded as a workflow artifact and pushed to `cloudinary-video-player-reports`.

- **Future alternative.** Artifact only, no push to another repository.
- **[SUGGESTION]** Pin `cpina/github-action-push-to-another-repository` to a commit SHA instead of `@main`. It runs with a bot token, so an unpinned version is a supply-chain risk.

---

## 8. Spec criteria → tests

| Criterion | Where it is proven |
|---|---|
| SC-002 URL parity | Unit (fixtures from T002) |
| SC-003 a v5 equivalent per kept v4 demo | Presets + unit check over `presets/` |
| SC-004 v4 configs | e2e over `test/fixtures/v4-configs/` |
| SC-006 TTFF | Release bench |
| SC-007 / FR-032 size | size-limit on every PR |
| SC-009 accessibility | axe + keyboard e2e |
| SC-010 leaks | Browser + e2e dispose test |
| SC-011 audit | `test/AUDIT-COVERAGE.md` |
| SC-012 poster first | e2e with a delayed route |
| SC-013 hosts | e2e request log |
| FR-031 CDN files and package | e2e `cdn` and `npm` modes, preview smoke, `lint:package`, Node import test |

---

## 9. Estimate

Phase 1 grows from 2 to about 3 eng-weeks (presets site, `examplePage` fixture, Netlify config, preview smoke, one preset through the whole pipeline). Phases 3 and 5 already held demo pages and e2e. Total ≈ 39 eng-weeks (±30 %).

---

## 10. Decisions (2026-11-23)

| Question | Recommended | Developer |
|---|---|---|
| What does full e2e run against; what is the preview for? | Local built artifact; preview for people + smoke | **As recommended** |
| Where does e2e media come from? | Local fixtures, live suite nightly | **Live Cloudinary always** |
| Who builds the preview? | CI builds once, uploads to Netlify | **Netlify, as in v4** (CI upload kept as a future alternative) |
| Push each report to the reports repository? | Stop; artifacts only | **Keep as in v4** (artifacts only kept as a future alternative) |
| `publint` and `@arethetypeswrong/cli`? | Add | **Approved if safe.** Checked: MIT, active maintainers, npm provenance, no install scripts, ~3 M and ~1.9 M weekly downloads; `attw` brings its own nested TypeScript 5.6. |
| Netlify site for v5? | A second site | **Keep the current site** |
| Extra layers (type tests, consumer apps, visual regression, contract check)? | All four | **None — keep it compact** |
| Coverage gates, mutation testing, playground? | Core coverage gate + changed-lines report | **None — "no coverage, only confidence"** |
| Example pages? | Page per feature | **One page + presets** |
| CI rules? | Flaky SLA, required checks, Slack alert, cancel + path filters | **KISS**: cancel old runs, required PR jobs, flaky tests fixed or skipped with a ticket |
