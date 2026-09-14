# Decision log — Portrait captions fix (VIDEO-21222)

## Engagement
- 2026-09-14: Sherpa engaged. Branch `fix/portrait-captions` cut from `master` (bfe00979). Spec artifacts live under `specs/portrait-captions/` on this branch only and are removed before merge (stage 8), matching the ads-playground precedent.

## 1. Context
- Ticket: VIDEO-21222 (Bug, component Video Player) — created earlier today from Gui Jolly's two Slack threads about Tudor's portrait training video: https://cloudinary.slack.com/archives/CF19HFLCR/p1788516357850259 and https://cloudinary.slack.com/archives/CF19HFLCR/p1789375961358059. Ticket already carries the full root-cause analysis and the verified CSS fix; Slack replies with the workaround were posted.
- Root cause (verified live on player.cloudinary.com embed at 390x760):
  1. vtt.js `FONT_SIZE_PERCENT = 0.05` sizes cue text from display *height* → ~35px on 9:16 vs ~11px on 16:9 at the same width.
  2. video.js 8 `TextTrackDisplay.updateForTrack` runs `WebVTT.processCues` (measures with inline `font: Npx sans-serif`, no padding, pixel-fixes top/height/width) and only afterwards adds the `vjs-text-track-cue` class. Our `text-tracks.scss` rules keyed on that class (Inter/inherit, 700, padding, inline-block) re-wrap the text after the box is frozen → text overflows the display bottom (12/12 sampled cues, 6–58px).
  3. Same freeze makes any `font-size` override (page CSS, `styledTextTracks.fontSize`) shrink the text inside a still-tall box → "floating in the middle", jumping with line count.
  4. Embed page `font-family: Inter` without fallback (embed repo, out of scope here).
- Verified fix: `height: auto; top: auto` on `.vjs-text-track-cue` (video.js does exactly this for its own `fontPercent` setting) + `container-type: size` on the display and `font-size: min(5cqh, Ycqw)` → 0/12 overflow, text bottom 6px above display bottom on every cue.
- Existing implementation: `src/assets/styles/components/text-tracks.scss` (defaults), `src/plugins/styled-text-tracks/` (theme/gravity classes + option-driven `<style>`), `src/plugins/text-tracks-manager/` (cue loading; untouched). Schema `src/config/configSchema.json` → `textTracks.options` (theme/fontFace/fontSize/gravity/box/style/wordHighlightStyle) — no schema change needed.
- Interactions to watch: `gravity-top` sets `top: 0 !important` (needs `bottom: auto` rather than `top: auto`); `gravity-center` uses `inset: 0; margin: auto` (leave alone); karaoke example on docs page uses `fontSize: '200%'` + `gravity: 'top'` and will now grow downward instead of overflowing its frozen box.
- Existing tests: `test/unit/text-tracks-manager-utils.test.js` (parsing only); e2e `subtitlesAndCaptionsPage.spec.ts` only checks the 5 demo videos play. No layout coverage anywhere; jsdom has no layout so this can only be an e2e check.
- Browser support note: `cqw/cqh` need Chrome 105 / Safari 16 / Firefox 110. Older browsers ignore the invalid `min()` and keep vtt.js's inline size — graceful degradation.

### Readiness assessment
- Requirements 95% — two Slack threads + ticket + customer screenshots; only open variable is the portrait font-size factor (taste).
- Architecture 95% — fix is CSS-only in files we own; mechanism verified in the browser against the real asset.
- Existing implementation 90% — read scss/plugins; gravity interactions identified.
- Testing 70% — no existing layout test; need a new e2e on a portrait asset (public `guillaume` asset or a `demo` portrait asset).
- UX 80% — final font-size factor for portrait needs a visual judgement by the developer.
- Recommendation: proceed.

## 2. Plan (2026-09-14)
- Scope: CSS-only fix in `src/assets/styles/components/text-tracks.scss` and `src/plugins/styled-text-tracks/styled-text-tracks.scss`; no JS, no schema change, no dependencies.
- Change A — box follows content: for default/bottom gravity, `.vjs-text-track-cue { height: auto !important; top: auto !important }` (bottom px anchor from vtt.js stays, box grows upward). Scoped with `:not(.cld-styled-text-tracks-gravity-top):not(.cld-styled-text-tracks-gravity-center)`. Gravity-top gets `bottom: auto !important; height: auto !important` alongside its existing `top: 0`. Gravity-center (`inset: 0; margin: auto`) untouched.
- Change B — aspect-ratio-aware size: `.vjs-text-track-display { container-type: size }` + `.vjs-text-track-cue { font-size: min(5cqh, 3.5cqw) !important }`. 5cqh reproduces vtt.js's landscape size exactly (16:9 at 390px → 11px, unchanged); portrait caps at 3.5% of width (390px → ~13.7px instead of ~35px). Applies to all themes incl. `videojs-default`, since the size bug is theme-independent. `styledTextTracks.fontSize` still works: it targets the inner `> div`, so percentages become relative to the new responsive base.
- Rejected: moving all metric-affecting rules to the structural selector `.vjs-text-track-display > div > div` so vtt.js measures the final styles — still leaves the box frozen against late webfont loads (the customer's Times→Inter swap) and any user CSS; the auto-height approach is robust to both. Rejected JS re-layout on `texttrackchange` — more code for the same result video.js itself achieves with `height:auto; top:auto`.
- Known trade-off: VTT/SRT cues with an explicit `line:` from the top keep their computed *bottom* edge and grow upward instead of downward. Only visible when text re-wraps vs. the measurement; accepted, documented here.
- Browser support: container-query units (Chrome 105 / Safari 16 / Firefox 110). Older browsers drop the invalid `min()` declaration and keep vtt.js's inline size; Change A still applies.
- Demo: add a "Portrait (9:16) player" section to `docs/subtitles-and-captions.html` using `aspectRatio: '9:16'` with the existing `prod` transcript asset (bug depends on the *player* box shape, not the video's); swap for a real portrait asset if one is available in `demo`/`prod`.
- Test: one Playwright e2e on that new section — every rendered cue's text rect stays inside `.vjs-text-track-display`, and cue font-size ≤ 4% of player width. No unit test (jsdom has no layout).
- Rollout: single small PR, `fix:` commit → patch release via the existing pipeline.

## 3. Spec (2026-09-14)
- `spec.md` written from the agreed plan: 2 user stories (portrait readability P1, font-size customisation P2), 4 edge cases, FR-1..5. No drift to check (new feature).

## 4. Implement (2026-09-14)
- `text-tracks.scss`: `container-type: size` on `.vjs-text-track-display`; `font-size: min(5cqh, 3.5cqw) !important` on `.vjs-text-track-cue`; `height: auto; top: auto` on cues for every gravity except top/center.
- `styled-text-tracks.scss`: gravity-top cues get `bottom: auto; height: auto` next to the existing `top: 0`.
- `docs/subtitles-and-captions.html`: new "Portrait (9:16) player" section (`#portrait`, prod `cloudinary-marketing-pm` cropped with `aspectRatio: '9:16', cropMode: 'fill'`, auto captions default). Code sample updated. ESM copy of the page (`docs/es-modules/`) deliberately not touched — the fix is CSS, one demo is enough (keeps the diff small).
- e2e: `commonSpecs/subtitlesAndCaptionsPortraitCues.ts` + `portraitVideoComponent` in the page object + one new `vpTest` in the NonESM spec. It plays the portrait player and, over ≥3 distinct cues, asserts text bottom ≤ display bottom and font-size ≤ 4% of player width. No ESM spec (page not changed there).

## 5. Test (2026-09-14)
- Scenarios: (must) portrait cue text inside display + font ≤ 4% width over ≥3 cues → e2e `subtitlesAndCaptionsPortraitCues.ts`; (must) landscape unchanged → covered by construction (`5cqh` term equals vtt.js's own size) and by the existing 5-video playing test; (nice) karaoke top-gravity 200% → checked manually in the dev server: box 50px follows the 34.5px text, top-anchored at 11px, inside the display. No unit tests: jsdom has no layout.
- `npm run lint` fails out of the box on this machine with ESLint 9.39 ("couldn't find eslint.config") — the repo still uses `.eslintrc.js`; `ESLINT_USE_FLAT_CONFIG=false npm run lint` passes clean. Pre-existing tooling quirk, not touched here.
- Sass check: `min(5cqh, 3.5cqw)` compiles to CSS `min()` unchanged (verified in the served stylesheet; `container-type: size` computed on the display).
- Playwright `subtitlesAndCaptionsPage.spec.ts`: 2/2 passed (existing playing test + new portrait test) against the local dev server.
- Test validity: with the two SCSS changes stashed, the portrait e2e fails as intended (`cue "…" spills below the caption display`, expected ≤ 1158.77). Restored; 2/2 pass again.
- `npm run test:unit`: 13 files, 129 tests passed.

## 6. Docs (2026-09-14)
- Impact: `docs/subtitles-and-captions.html` (new portrait section + code sample) — done. `docs/index.html` unchanged (page already listed). README: no text-track styling section to update. `configSchema.json`: no option added/changed. CHANGELOG is release-generated from commits.
- Control-bar interaction verified with a Playwright script on the portrait demo: cue box bottom sits 22px above the player bottom while controls are hidden and moves to 70px when the control bar shows (display `bottom` 1em ↔ 5em) — video.js re-lays out on user activity, the auto-height box follows. An earlier in-pane experiment suggesting a stale cache was an artifact of a never-cleared `hasBeenReset` expando on native VTTCue objects.
- Screenshots for the PR captured from the demo (before: 4-line ~50px caption spilling past the bottom; after: 2-line caption pinned above the control bar area).
