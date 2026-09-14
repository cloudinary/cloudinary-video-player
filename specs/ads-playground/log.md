# Decision log — Ads playground (VIDEO-21179)

## Engagement
- 2026-09-01: Sherpa engaged on branch `feat/ads-playground`. SpecKit (`.specify/`) and `specs/` added to this branch by explicit developer approval; they will NOT be merged to master (developer strips them before deploy). No new package dependencies allowed. `.sherpa/FLOW.md` also lives on this branch only — the repo's AGENTS.md deliberately carries no Sherpa directive (developer chose not to introduce Sherpa to the repo).

## 1. Context
- Ticket: VIDEO-21179 "Interactive ads playground for the video player (sales/SE demo tool)" — created this session from Raz's request in Slack (https://cloudinary.slack.com/archives/C0BSA33PVKR/p1787718731687349). Story, assigned to Tsachi, component Video Player, standalone (no epic — explicit developer decision).
- Grooming source: the Slack thread itself. Key facts: FT opportunity (~100k) is the driver; customer-facing teams struggle to configure/demo ads; native mobile ads are a separate track owned by Adi (≥1 sprint); SSAI and IAS/DoubleVerify out of scope.
- Existing implementation: `docs/vast-vpaid.html` (static example, hardcoded GAM ad tag, cloud_name demo). Ads plugin: `src/plugins/ima/index.js` wraps videojs-ima + contrib-ads; config surface in `src/config/configSchema.json` (`ads`: adTagUrl, showCountdown, adLabel, locale, prerollTimeout, postrollTimeout, adsInPlaylist) + validators in `src/validators/validators.js`.
- Known bug found while scoping: `ima/index.js` passes `playerOptions.ads.denug` (typo) → `debug` flag never worked. Also `debug`/`autoPlayAdBreaks` accepted by plugin but absent from schema. Fix is in scope of this PR (developer approved single PR).
- UI direction (developer): much richer/more modern than existing dev-oriented example pages. Reference designs: https://cloudinary.com/agents, https://videoapi.cloudinary.com/video-demo/video-transformations, https://videoapi.cloudinary.com/video-demo/zoom-and-pan. Visual refs not yet captured — planned during design/implementation.
- Constraints: single PR incl. the denug fix; work local, push only after approval; no new dependencies; vanilla JS demo page in docs/ served by existing tooling.

### UI reference capture (2026-09-01)
Captured via browser from the three reference pages:

**cloudinary.com/agents** (richest token system, dark theme):
- bg: #070F1A, panel bg2: #0B1623, bg3: #162436; text #fff, dim rgba(255,255,255,.58), faint .30, hairline rgba(255,255,255,.09)
- accent blue #0095FF; secondary indigo #3448C5, pink #FE5981
- font: Inter (800 for display, 700 buttons, 400 body)
- radii: card 16px, card-large 32px, card-small 8px, input 6px, button 32px (pill), badge 4px
- buttons: solid #0095FF pill, 14px/700, pad 10px 22px
- cards: bg2 + 1px hairline border, radius 16, no shadow (dark theme = borders not shadows)
- shadows/highlights: subtle white ring highlights (0 0 0 1px rgba(255,255,255,.04–.14))

**videoapi.cloudinary.com/video-demo/*** (the demo-page pattern to follow):
- layout: dark navy hero (gradient 170deg #162436→#2A3E58) with breadcrumb (DEMOS / <name>, blue), 47px/500 Inter h1, one-line subtitle
- source selector: horizontal thumbnail strip, active thumb gets blue border ring; last cell = dashed "upload" tile
- demo panel: video preview left, control rack right; toggle switches (pill 34x18, on=#3549C5) + sliders per option, value labels
- Apply button: #3549C5, radius 4
- note line: "Results are generated in real time…"

**Synthesis for the playground page** (decision): go with the agents-page dark token system (#070F1A family + #0095FF accent, Inter, 16px card radius, pill buttons, hairline borders) applied to the videoapi demo-page layout (hero + breadcrumb, thumbnail source strip, preview-left/controls-right rack with toggle switches). Skip Bootstrap entirely — self-contained CSS on the page. Inter via Google Fonts (font files, not a code dependency).
- 2026-09-01: Standalone page — deliberately NOT linked from docs/index.html (developer decision; sales tool, not a developer example).

## 4. Implement (2026-09-01)
- FR-9 fix: `denug`→`debug` in src/plugins/ima/index.js; `debug` + `autoPlayAdBreaks` added to configSchema.json (props + defaults) and validators.js.
- New unit test test/unit/ima-plugin-options.test.js (4 tests): debug pass-through (would have caught the typo), full option mapping, first-video vs every-video ad-break wiring. Mocks `~/plugins/ima/ima` to avoid loading videojs-ima; mock mirrors videojs-ima's behavior of replacing player.ima with a controller object after init.
- docs/ads-playground.html built: self-contained CSS token system (agents-page palette), videoapi-style layout, presets from Google's public IMA sample tags (single_ad_samples/vmap_ad_samples network 21775744923), event log wired to contrib-ads/ima events, dispose+recreate on Apply, copy-config snippet, URLSearchParams round-trip, reset. Standalone — not linked from index (decision).
- Design-review gate run (static): fixed unused tokens, hardcoded accent hover/active hexes, AA contrast on log empty/timestamps (--faint→--dim), added prefers-reduced-motion, badge radius token. Residual: real ad rendering + exact contrast need a visual pass.
- Testing status: 133/133 unit tests pass. `npm run lint` is BROKEN on a clean tree (ESLint 9 without flat config — pre-existing, out of scope; spawned a separate task chip). Changed files pass with ESLINT_USE_FLAT_CONFIG=false.

## Test stage — "no ads locally" investigation (2026-09-02)

Symptom: on the developer's machine, every ad request failed with IMA AdError 1005
(VAST_LOAD_ERROR, inner "Error: 6" = HTTP_ERROR, status -1) at
http://localhost:3000/ads-playground.html, while content played fine.

Elimination path:
1. Player code exonerated — a raw `google.ima.AdsLoader` harness injected on the same
   page (no video player involved) failed identically.
2. Network exonerated — page-context fetch/XHR of the same ad tag returned 200 with a
   valid VAST document.
3. Extensions exonerated — uBlock Origin Lite was strict-blocking at first, but after
   disabling it (and finally in Incognito with all extensions off) the failure persisted.
4. Discriminator found — Google's own HTTPS IMA demo page loaded ads successfully in the
   same Chrome, same minute. Only difference: origin scheme. Chrome had also logged a
   COOP warning: "the URL's origin was untrustworthy … deliver the response using HTTPS."

Root cause: the IMA SDK issues its ad request from an SDK-created iframe; on this
machine's Chrome (likely enterprise policy or newer hardening), those requests are
silently killed with a network-level error when the embedding page is a plain-http
origin. Serving the same page over HTTPS (`npx webpack serve --config
webpack/dev.config.js --server-type https --port 3443`, self-signed cert) fixed it —
ads play.

Consequences:
- Local-dev-only issue; the deployed docs site is HTTPS, so SEs are unaffected.
- The page's ad-error notice now appends an "serve over https" hint when
  `location.protocol === 'http:'`.

## Second bug found via deploy preview — contrib-ads loadstart race (2026-09-02)

On the PR's Netlify preview the console showed videojs-contrib-ads' "has not seen a
loadstart event 5 seconds after being initialized" error. Developer's hunch (correct):
the plugin's async loading. `imaPlugin` awaits a dynamic `import('./ima')` (a
network-fetched chunk that registers contrib-ads + videojs-ima) while the page sets the
source synchronously — when the media element's `loadstart` beats the chunk download,
contrib-ads misses it, and its preroll state machine waits indefinitely ("Waiting for
loadstart..."), so ads never play. Localhost usually wins the race (fast chunk); a real
CDN deploy usually loses it — which is why the playground worked locally but not on the
preview.

Fix: the plugin body runs synchronously up to the `await`, before any source exists, so
it arms a one-shot `loadstart` recorder there and replays the event after `player.ima()`
initializes (only when it was actually missed). Covered by two new unit tests; verified
on the rebuilt preview — flag set, no error.
