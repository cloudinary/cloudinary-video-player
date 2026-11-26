# S-2: Which skin to eject, and does its CSS meet the floor?

**Question.** Which Video.js 10 skin do we eject (Compat or Default), and does its CSS meet the floor (Chrome and Edge 111, Firefox 121, Safari and iOS 16.4)?

**Answer.** Eject **Compat** and flatten its `@scope`. Neither registry skin meets the floor as fetched: both need `@scope` (Chrome 118, Firefox 146, Safari 17.4) and CSS nesting `&` (Chrome 120, Safari 17.2). After the flatten, neither skin needs a feature above the floor; what is left only degrades a detail. Compat loses fewer details at the floor than Default. The run on real floor browsers is **not verified here**.

## Method

- **Versions.** `@videojs/html` 10.7.0 (the registry serves only the current release, so the skin source is 10.7.0, not the plan's 10.3.0). postcss 8.5.14 and postcss-selector-parser 7.1.7 for the flatten, Lightning CSS 1.33.0 for parse checks and the prefix probe, caniuse-lite 1.0.30001760 with browserslist 4.28.1 for support data, Rolldown 1.3.3 for the test bundle. Engines from `@playwright/test` 1.60.0, headless on macOS: Chromium 148.0.7778.96, Firefox 150.0.2, WebKit 26.4. All of these are already in `node_modules`; nothing was installed.
- **Steps** (`spike.mjs`):
  1. `fetch` reads `https://shadcn.videojs.org/r/html/video.json` (Default) and `…/r/html/compat/video.json` (Compat), follows `registryDependencies`, and writes each file to `ejected/<skin>/` (paths as the registry targets them, without `@components/`) plus `ejected/manifest.json`.
  2. `flatten` joins the CSS that `skin.ts` imports (in import order, `@import` inlined) and runs the PostCSS plugin from `@videojs/html` `docs/guides/browser-support.md` ("Flatten `@scope` in registry skins"), with one guard for keyframe selectors. It then checks the output (table below) and writes `build/<skin>.flat.css`.
  3. `audit` scans the raw, flattened and packaged (`@videojs/html/dist`) sheets for 24 newer CSS features. To make sure the list is complete, a one-off PostCSS walk listed every at-rule, pseudo-class, pseudo-element, function, unit and property in both flattened sheets; the two newer features it found outside the first list (container style queries, `linear()` easing) were added. Support versions come from caniuse-lite; where it has no entry, from the bundled Video.js docs or a Lightning CSS compat-data probe. Each use is classified as bare, inside `@supports`, after a fallback declaration, inside a custom property, or inside forgiving `:is()`/`:where()`.
  4. `browser` bundles `ejected/<skin>/…/skin.ts` with the player and `fixtures/own-ui.js`, builds a page from `skin.html` with an MP4 (`https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4`, 15.2 s), the logo button and the overlay, and drives it in the three engines. It also loads the raw (`@scope`) and the flattened CSS into the same page and compares every computed property of every element and pseudo-element.
- **Run** from the repo root: `BROWSERSLIST_IGNORE_OLD_DATA=1 node spikes/s2-skin/spike.mjs [fetch] [flatten] [audit] [browser]`. No argument runs all steps (`fetch` only when `ejected/manifest.json` is missing). Output: `results.json`; generated CSS, pages, bundles and screenshots go to `build/` (git-ignored).

## Results

| # | Exit criterion | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | Ejectable source for Compat and Default from the registry JSON | **yes** | `ejected/default/` (9 files: `video/skin.{html,ts,css}` and 6 style files), `ejected/compat/` (11 files: the same plus `styles/video/compat.css` and `styles/themes/compat.css`). `manifest.json` lists the registry items and their `@videojs/html@10.7.0` dependency. The files are Video.js source (Apache-2.0), unchanged. |
| 2a | Flatten `@scope` in the Default CSS with a small script | **yes** (both skins) | Default: 98 `@scope` blocks, 59 `&`, 12 scoped `:scope` → 0. Compat: 65, 42, 11 → 0. Checks pass for both: no `@scope` left, no `@scope … to (…)` in the source, no true nesting, keyframes untouched, the same style-rule count (455 and 380), Lightning CSS parses the output with no warnings. Against the packaged `dist` CSS (Lightning CSS-normalized): Default 1442 of 1531 declarations match with 0 value differences; Compat 1227 of 1273, 0 value differences. The rest differ only in how nested scopes are written or are packaged shadow-DOM rules. |
| 2b | Other above-floor CSS features in both skins (caniuse-lite, browserslist, Lightning CSS) | **yes**: none required; some degrade | Table "Features above the floor" below. |
| 3 | Both ejected skins in current Chromium, Firefox and WebKit with an MP4: renders, play/pause, time slider | **yes** (6 of 6 runs) | All runs: 800×450 render, every custom element upgraded, all 455 / 380 style rules parsed, play (center button) and pause (bar button) with `playing`/`pause` events, slider seek by pointer at 50 % (≈ 7.6 s of 15.2 s) and by `ArrowRight`, 0 page errors. |
| 4 | One own control in the control bar and one overlay above the media, inside the fullscreen container (Chromium) | **yes** (also passes in Firefox and WebKit) | Logo button: 36×36 like the nearest bar button, same row, `role=button`, label "Cloudinary", `tabIndex` 0; 3 activations (click, Enter, Space); `data-paused` follows play and pause through `PlayerController`. Overlay: `z-index` 25, a child of `media-container`; the hit test at its center finds the overlay; stretched over the whole player, the bar play button still wins (controls stay usable); after the fullscreen button, `document.fullscreenElement` is the `media-container` and holds the overlay and the logo, and the overlay is still on top. Screenshots: `build/shots/`. |
| 5 | Recommend Compat or flattened Default, with the floor verdict | **Compat, flattened**; floor run **not verified here** | The floor engines (Chrome 111, Firefox 121, Safari 16.4) are not installed. The verdict comes from support data, not from a run. See the checklist. |

### Features above the floor (after the flatten)

Versions are Chrome / Firefox / Safari. "Bare" means outside `@supports`, without a fallback.

| Feature | Support | Default | Compat | Effect at the floor |
| --- | --- | --- | --- | --- |
| `@scope`, CSS nesting `&` | 118/146/17.4, 120/117/17.2 | 98, 59 → 0 | 65, 42 → 0 | Removed by the flatten. Without it, both skins fail the floor. |
| `backdrop-filter` (unprefixed) | 76/103/**18** | 11 bare | 4 bare, tokens set to `none` | Default loses the frosted blur on Safari 16.4–17.x. Packaged CSS and Lightning CSS add `-webkit-backdrop-filter` (10 / 4). |
| Relative color `oklch(from …)` | 131/133/18 | 1 custom property, used in 9 `filter: drop-shadow` and 5 `text-shadow` | 1 custom property, not used in a shadow | Default loses its subtle icon and text shadows below those versions (invalid at computed-value time). Compat: no effect. |
| Anchor positioning (`anchor-scope`) | 125/147/26 | 2 bare (6 in `@supports`) | not used | Default: the JavaScript fallback positions the menu highlight (per the docs). |
| `@property` (`--media-slider-fill`, `--media-slider-buffer`) | no local data | 2, transitioned | 2, not transitioned | Every use has a `var(…, 0%)` fallback, so the fill is correct. Default loses the smooth fill animation where `@property` is missing (Firefox before about 128; version not verified here). |
| `scrollbar-color` / `scrollbar-width` | 121/64/— | 3 bare | 3 bare | Native scrollbars in menus on Chrome 111–120 and Safari. |
| Container style queries, `@container not style(--media-controls-before-start: visible)` | 111 (custom properties only, which is all the skins use) / none in caniuse-lite up to 148 / 18 | 2 bare | 2 bare | Hides the controls before the first play (Default: backdrop and content; Compat: top and bottom bars). Where it is not supported (Firefox, Safari 16.4–17.x), the controls stay visible before the first play. Nothing breaks. |
| `linear()` easing | no local data | 1 bare | not used | Default: the volume indicator loses its bounce at minimum and maximum volume (the whole `transition` declaration is dropped). |
| `corner-shape`, `interpolate-size` | no local data | 1, 1 bare | 0, 1 bare | Square-ish corners and no size animation where missing. |
| `:dir()`, `light-dark()`, `contrast-color()` | 120/49/16.4, 123/120/17.5, 147/146/26 | 9, 2, 2 | 11, 15, 5 | Guarded (inside `:is()`/`:where()` beside `[dir=rtl]`, or in `@supports`). No effect. |
| `:has()`, `@container`, cq units, `@layer`, `color-mix()`, `oklch()`, `dvh` | at or below the floor | used | used | None. `:has()` sets the Firefox 121 floor. |

## Key numbers

- Skin CSS, minified + gzip: Default 10.3 KB raw → 10.5 KB flattened; Compat 8.8 KB → 9.0 KB. The flatten costs ≈ 0.2 KB gzip (unminified: +15 KB Default, +18 KB Compat).
- Style rules: Default 455, Compat 380 (≈ 16 % fewer). Compat CSS is ≈ 14 % smaller.
- Test bundle (player + ejected `skin.ts` + own UI, JS only, first load, gzip): Default 68.8 KB, Compat 68.1 KB. With the CSS: 79.3 KB and 77.1 KB. S-1 measured the packaged skins (CSS inside the JS) at 82.1 KB and 80.2 KB. These totals have every control in the first load and no own-code allowance, so they are not S-1's design A or B.
- Computed-style comparison, raw `@scope` vs flattened, per run ≈ 580 000 to 700 000 values, in one page state (loaded, clip buffered, before play, no hover, no menu or dialog open): Chromium and Firefox 0 differences (the page waits until the whole clip is buffered, and a flat-vs-flat baseline shows no noise). WebKit 26.4: 424 (Default) and 113 (Compat) differences, all on shadow-host elements and their children (`media-poster`, `media-slider-thumbnail`, `media-icon`, `img`, `svg`, `path`).
- Cause of the WebKit differences: WebKit 26.4 (the Playwright build) does not match a shadow host with a selector inside `@scope`. Minimal repro (Chromium 148 and Firefox 150 match all three; WebKit misses only the shadow host):

  ```html
  <style>@scope (.r) { * { color: red } }</style>
  <div class="r"><x-host>host</x-host><x-plain>plain</x-plain><span>span</span></div>
  <script>customElements.define('x-host', class extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<slot></slot>'; } });</script>
  ```

  So in this WebKit build the flattened CSS styles these elements like Chrome and Firefox, and the raw `@scope` CSS does not. Real Safari versions are not verified here (see the checklist). This is one more reason to flatten.

## Code sketch

```js
// 1. Skin CSS: the ejected Compat source keeps @scope; flatten it before any lowering step.
//    flattenScope() is the plugin from @videojs/html docs/guides/browser-support.md.
export default { plugins: [flattenScope()] }; // postcss.config.mjs
// If Lightning CSS lowers the result: floor targets, exclude: Features.LightDark | Features.DirSelector
// (otherwise it rewrites the guarded fallbacks). It then adds only -webkit-backdrop-filter.

// 2. Own control-bar control: public APIs only (see fixtures/own-ui.js for the full version).
import { PlayerController, UIElement, playerContext, selectPlayback } from '@videojs/html';
class CldLogoButtonElement extends UIElement {
  #playback = new PlayerController(this, playerContext, selectPlayback);
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'button'); // + aria-label, tabindex=0, Enter on keydown, Space on keyup
  }
  update(changed) {
    super.update(changed);
    const playback = this.#playback.value; // undefined when the feature is not configured
    if (playback) this.toggleAttribute('data-paused', playback.paused);
  }
}
customElements.define('cld-logo-button', CldLogoButtonElement);
// skin.html: <cld-logo-button class="media-button"><svg …/></cld-logo-button> in a bottom media-controls-group
```

```css
/* 3. Overlay: a direct child of media-container (the fullscreen element). Skin scale: 10 scrim,
   20 title/indicators/popups, 30 controls, 40-50 dialogs. 25 = above the media, below the controls. */
.media-skin .cld-overlay { position: absolute; z-index: 25; }
```

## Device / floor checklist

A human must still check these with the flattened Compat CSS (and Default, if it stays a candidate):

- [ ] Chrome 111, Firefox 121, Safari 16.4 (macOS) and iOS Safari 16.4: the player renders, play/pause, the time slider (pointer and keys), the volume popover, the settings menus and captions work, with no console errors.
- [ ] Safari 16.4–17.x: surfaces look right without blur (Compat sets blur to `none`; Default needs `-webkit-backdrop-filter` if it keeps blur).
- [ ] Safari 17.4 and later: `media-poster`, the slider thumbnail and icons look the same as in Chrome (the flatten removes the WebKit 26.4 shadow-host `@scope` miss; confirm on real Safari).
- [ ] Firefox and Safari 16.4–17.x: the controls showing before the first play (no container style queries) is acceptable.
- [ ] Chrome 111–122 and Safari 16.4–17.4: menu and popup colors are right where `light-dark()` is not supported.
- [ ] Firefox 121–127: the slider fill is correct (Default: the fill does not animate).
- [ ] An RTL page in Chrome 111–119: arrows and slider direction are mirrored (`[dir=rtl]` fallback for `:dir()`).
- [ ] iPhone (iOS 16.4 and current): which fullscreen the player uses. If it falls back to the native video fullscreen, the overlay and the logo control are not visible in fullscreen.
- [ ] Touch devices: the overlay does not block taps on the controls; the logo control can be operated.
- [ ] VoiceOver and NVDA: the logo control is announced as "Cloudinary, button".

## Open questions for the developer

1. **Where to flatten.** (a) Keep `@scope` in the ejected source and flatten in the build, as the docs show. The source stays easy to diff with upstream, but `postcss` and `postcss-selector-parser` become direct devDependencies. Both are in `node_modules` already, as transitive dependencies (`postcss` is pinned only through `overrides`), so nothing new is downloaded, but AGENTS.md asks for approval. (b) Flatten once at eject and commit the flat CSS. No new dependency, but the selectors are long and hard to diff with upstream. Which one?
2. **Version.** The registry serves only the 10.7.0 skin source; the plan pins 10.3.0. Eject from 10.7.0 and move the pin (S-1 also measured 10.7.0), or rebuild the 10.3.0 source by hand?
3. **Scaffold skin.** The docs list a fourth skin, Scaffold: "Compat's controls with minimal styling", meant as the base for a full restyle, with the same older-browser reach as Compat. The registry has it (`…/r/html/scaffold/video.json`, 58 `@scope` blocks in `skin.css`, so it needs the same flatten). If v5 restyles the whole player to the v4 look, Scaffold may be a better start than Compat. It was not tested here. Should it be a candidate?
4. **Overlay layer.** Use `z-index` 25 for all Cloudinary overlays (above the media, below the controls)? Should overlays hide with the controls when the user is idle?
5. **Logo action.** The fixture only fires `cld-logo-activate`. Confirm that v5 opens the Cloudinary link in a new tab, as v4 does.
