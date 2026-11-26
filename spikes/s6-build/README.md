# S-6 · Build and CDN loading

**Question.** Does one tsdown config give (1) an ESM build for npm (entries + lazy chunks, one CSS file per chunk, `.d.ts`) and (2) a tiny classic IIFE loader for the CDN that loads those chunks with a native `import()` from a URL computed from `document.currentScript.src`, cross-origin, with `defer` and `async`? Do the TypeScript 7 + `isolatedDeclarations` types feed ts-json-schema-generator, and does oxlint `no-restricted-imports` enforce the ring rules and the Video.js `@internal` name ban? (`research.md` R-01, R-09; task T009.)

## Method

**Versions.** tsdown 0.23.7 (Rolldown 1.3.3 inside; `.d.ts` by rolldown-plugin-dts 0.30.2 with the oxc generator), Rolldown 1.3.3, Lightning CSS 1.33.0, TypeScript 7.0.2 (npm alias `typescript7`), TypeScript 5.9.3 (root `typescript`, used by the schema generator), ts-json-schema-generator 2.10.0, oxlint 1.95.0, @videojs/html 10.7.0 (the plan pins 10.3.0; only its type names are used here), Node 24. Build target: `chrome111, firefox121, safari16.4` (plan floor). **Not installed:** `@tsdown/css` (needed by tsdown `css`), `oxlint-tsgolint`/`tsrs` (needed by `oxlint --type-aware`).

**Engines.** Playwright 1.60, headless: Chromium 148.0, Firefox 150.0, WebKit 26.4 (all newer than the floor).

**Fixture** (`src/`, TypeScript, plan layout): `core/` (options type, `cloudPrefix`, ring contracts), `shell/` (stand-in shell: `createShell(loadLayer)`, `<cld-video-player>`), `player/` (layer entry `esm/player.js`, `context.ts`, option → lazy feature map), `features/{chapters,title}/index.ts` + one CSS file each, `entries/index.ts` (npm) and `entries/cdn-loader.ts` (IIFE). `*.bad.ts` files are lint cases (excluded from tsc and never bundled). `cases/` holds the TS negative control, the mechanism-only loader and a TS probe of where Video.js exports its `@internal` names. `css-split-plugin.mjs` is an **own ~30-line plugin** that stands in for `@tsdown/css` `splitting: true` with the same naming rule (CSS file = JS chunk file name with `.css`, read from the published `@tsdown/css@0.23.7` source; that file was only read, not run).

**Cross-origin topology.** Page on origin A (`http://127.0.0.1:<a>`); loader, ESM chunks and CSS on origin B (`http://127.0.0.1:<b>`), as on jsDelivr. B+ sends `Access-Control-Allow-Origin: *`, B− sends none; both send `Cache-Control: no-store`; every case uses a new browser context. The task text says "loader on A, chunks on B"; with the R-09 design the loader computes its base from its own `src`, so the loader and its chunks always share an origin. The cross-origin hop that matters is page → CDN, and that is what is tested.

**How to run** (from the repository root, after the `spikes/README.md` install):

```bash
node spikes/s6-build/build.mjs     # criteria 1, 2, 4 → dist/ (git-ignored), results-build.json
node spikes/s6-build/cors.mjs      # criterion 3 (needs dist/) → results-cors.json
sh spikes/s6-build/cdn-headers.sh  # criterion 3, public CDN headers → cdn-headers.txt
node spikes/s6-build/types.mjs     # criterion 5 (+ Video.js name probe) → schema.json, results-types.json
node spikes/s6-build/lint.mjs      # criterion 6 → results-lint.json
```

## Results

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | tsdown IIFE keeps a native `import()` with a computed URL | **yes** | Output lines below. No `require`, no static import, no preload helper; layer code (`video/upload`, `cld-chapters`) is absent from the loader. Plain Rolldown IIFE: same. |
| 2a | tsdown `css.splitting` gives one CSS per lazy chunk | **not verified here** | `@tsdown/css` is not installed. tsdown without it stops: `CSS file "./src/features/chapters/chapters.css" was encountered but @tsdown/css is not installed`. From its source: with `splitting: true` the CSS name is `chunk.fileName` with `.js` → `.css`. |
| 2b | Plain Rolldown fallback (no plugin) | **no** | Rolldown 1.3.3: `[UNSUPPORTED_FEATURE] Bundling CSS is no longer supported (experimental support has been removed)`. |
| 2c | Own plugin (tsdown `css: false` + `css-split-plugin.mjs`, or plain Rolldown + same plugin) | **yes** | One CSS per lazy chunk, named after it: `chapters-D3mG6B3Z.js` + `chapters-D3mG6B3Z.css`, `title-D-f1KiRM.js` + `title-D-f1KiRM.css`; same names from tsdown and Rolldown, same names on a rebuild. Stable names: `hash: false` (or `chunkFileNames: '[name].js'`) → `chapters.css`, `title.css`. No `index.js`/`index2.js` clash: Rolldown names a `features/x/index.ts` chunk `x`. No manifest needed: the chunk finds its CSS from `import.meta.url` (`.js` → `.css`), hashed or not. **Caveat:** the CSS name comes from the JS chunk hash, so a CSS-only change keeps the same file name (verified with the own plugin). |
| 3 | Cross-origin load, `defer` and `async`, 3 engines; without CORS; jsDelivr/unpkg headers | **yes** | 12/12 runs as expected (`results-cors.json`). With CORS: layer, both feature chunks and both CSS files load and run (`getComputedStyle` = `rgb(1, 2, 3)` / `rgb(7, 8, 9)`); in all 12 runs, B sees `Origin: <A>` and `Sec-Fetch-Mode: cors` for every module, and `no-cors` (no `Origin`) for the loader and the CSS. Without CORS: the loader still runs (`<cld-video-player>` defined, `window.cloudinary` set), `import()` of `esm/player.js` rejects, and a CSS `<link>` still loads. Errors: Chromium `Failed to fetch dynamically imported module`, Firefox `error loading dynamically imported module`, WebKit `Cross-origin script load denied by Cross-Origin Resource Sharing policy.` CDNs: see below. |
| 4 | Loader ≤ 10 KB gzip | **yes** (mechanism) / **not verified here** (real shell) | Fixture loader (stand-in shell + mechanism) 1,064 B raw, **571 B gzip -9**, 454 B brotli. Mechanism alone (`cases/min-loader.ts`): 123 B raw, 126 B gzip; the IIFE wrapper adds only `(function(){…})();`. The real shell is not written yet. |
| 5 | Schema generator reads the TS 7-style type; TS 7 `tsc --noEmit` passes with `isolatedDeclarations` | **yes**, with a separate tsconfig | TS 7.0.2 `tsc -p tsconfig.json`: exit 0 (511 files with Video.js types). Negative control `cases/no-return-type.ts`: `error TS9013: Expression type can't be inferred with --isolatedDeclarations` (flag is active). Generator with `tsconfig.schema.json`: exit 0, `schema.json` written. With the main tsconfig it stops (`TSJ - 108: Type check error`; cause `TS5069: Option 'isolatedDeclarations' cannot be specified without specifying option 'declaration'…` — the generator deletes `declaration`). The generator does **not** bundle TypeScript: peer `typescript >=5.9 <7`, resolved to the root `typescript@5.9.3`. |
| 6 | oxlint ring rules (per-folder overrides) and `@internal` name ban; clean file passes; `--type-aware` | **yes** / `--type-aware` **not verified here** | 27 files: all 14 `*.bad.ts` caught, all 13 clean files (features → `core` + `player/context`; player → public `createPlayer`, `videoFeatures`) pass (`results-lint.json`). Caught: core → shell, core → `@videojs/*`, shell → player (static, dynamic `import()`, and directory `../player`), feature → feature (`../title/…` and `../../features/chapters/…`), feature → `player/features.js`, `@internal` names from `@videojs/html`, `@videojs/core` and `@videojs/store` (named, type-only, re-export, inside an override folder), namespace import (`* import is invalid because 'definePlayerFeature, …' from '@videojs/html' is restricted`). Overrides **replace** the base options: with `oxlintrc.no-repeat.json` (same config without the `paths` list in the overrides), `features/chapters/internal-name.bad.ts` is not caught. The config turns off the default `correctness` category, so "clean" covers `no-restricted-imports` only. `--type-aware`: `Failed to find type-aware linter executable. You may need to add the tsrs or oxlint-tsgolint package to your project?` |

**Criterion 1 output lines** (`dist/player.min.js`, minified, then the unminified build):

```js
let i=document.currentScript,a=new URL(`.`,i.src),o=new URL(`./esm/player.js`,a).href,s=r(()=>import(o));s.defineElement(),window.cloudinary=s})();
const shell = createShell(() => import(layerUrl));
```

**CDN headers** (`cdn-headers.txt`, `curl -sIL`, with and without an `Origin` header, file `@videojs/html@10.7.0/dist/default/index.js` and a `.css`):

| CDN | `access-control-allow-origin` | `content-type` (.js / .css) | Notes |
|---|---|---|---|
| jsDelivr | `*` | `application/javascript; charset=utf-8` / `text/css; charset=utf-8` | exact version: `max-age=31536000, immutable`; range `@10`: served directly (200, no redirect), `max-age=604800, s-maxage=43200`, `x-jsd-version: 10.7.0` |
| unpkg | `*` | `text/javascript; charset=utf-8` / `text/css; charset=utf-8` | exact version: `max-age=31536000`; range `@10`: `302` to `@10.7.0` (the redirect also has `access-control-allow-origin: *`) |

Both send `cross-origin-resource-policy: cross-origin`. Both MIME types are valid JavaScript types for module scripts.

## Key numbers

- Loader: **571 B gzip** (budget 10,240 B); mechanism only 126 B gzip.
- ESM output: `index.js`, `player.js` (unhashed entries), `cloud-*.js`, `context-*.js` (shared), `chapters-*.js/.css`, `title-*.js/.css`, `index.d.ts`, `player.d.ts`, `types-*.d.ts`. Both builds ≈ 0.6 s.
- TS 7 type check of the fixture: ≈ 0.2 s.
- Browser matrix: 3 engines × {defer, async} × {CORS, no CORS} = 12/12 as expected.

**Schema excerpt** (`schema.json`, draft-07, `--functions hide`):

```json
"skin": { "$ref": "#/definitions/Skin", "default": "dark", "description": "Skin color scheme." },
"Skin": { "enum": ["dark", "light"], "type": "string" },          // from (typeof SKINS)[number]
"autoplayOnScroll": { "default": false, "deprecated": "Use `autoplayMode: \"on-scroll\"`.", "type": "boolean" },
"volume": { "default": 1, "maximum": 1, "minimum": 0, "type": "number" },
"chapters": { "anyOf": [{ "type": "boolean" }, { "$ref": "#/definitions/ChaptersOptions" }] }
// onReady (a function) is left out; "required": ["cloudName"]
```

## Config sketch for v5

```ts
// tsdown.config.ts — one config, two builds
import { defineConfig, type UserConfig } from 'tsdown';
const common: UserConfig = {
  platform: 'browser', target: ['chrome111', 'firefox121', 'safari16.4'],
  tsconfig: 'tsconfig.json', minify: true, clean: false,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
};
export default defineConfig([
  { ...common, name: 'esm', format: 'esm', outDir: 'dist/esm',
    entry: { index: 'src/entries/index.ts', player: 'src/player/index.ts' },
    dts: true, // oxc generator, because tsconfig has isolatedDeclarations (no TS API needed)
    css: { splitting: true, minify: true }, // needs @tsdown/css pinned to tsdown; or css: false + own plugin
  }, // defaults: entries [name].js (esm/player.js unhashed), chunks [name]-[hash].js, CSS = chunk name + .css
  { ...common, name: 'cdn', format: 'iife', outDir: 'dist', dts: false,
    entry: { 'player.min': 'src/entries/cdn-loader.ts' },
    outputOptions: { entryFileNames: '[name].js' }, // tsdown default is [name].iife.js
  },
]);
// cdn-loader.ts (top level): const base = new URL('.', (document.currentScript as HTMLScriptElement).src);
//   createShell(() => import(new URL('./esm/player.js', base).href));   // no import.meta in shared shell code
// feature chunk: await loadCss(import.meta.url.replace(/\.js(?=[?#]|$)/, '.css'));
// schema: ts-json-schema-generator -f tsconfig.schema.json -p src/core/options.ts -t PlayerOptions --functions hide
// lint: .oxlintrc.json here — the @internal "paths" list is repeated in every override (overrides replace options)
```

## Device / floor checklist (a human must still check)

- [ ] Real floor browsers: Safari 16.4 (macOS and iOS), Chrome 111, Firefox 121 — `import()` from a classic `defer`/`async` script, cross-origin, plus the CSS `<link>`. The engines here are newer.
- [ ] iOS WKWebView and Android System WebView at the same engines.
- [ ] A real CDN load: publish a test package (not done here: nothing was published) and load the loader from jsDelivr and unpkg, with an exact version and with a range (`@5`).
- [ ] Customer pages with a CSP: `script-src` must allow the CDN for the module fetches; check nonce + `'strict-dynamic'` pages.
- [ ] Loader injected by a tag manager (dynamically inserted `<script>`): `document.currentScript` must still be the loader. A loader that is inlined or re-bundled by the customer loses its `src` (no base).
- [ ] Only the `<cld-video-player>` path was tested. A page that calls `cloudinary.videoPlayer()` in an inline script right after a `defer` or `async` loader tag runs before the loader, so `window.cloudinary` is not there yet. Check the v4 README snippet and decide on a ready queue or event.
- [ ] Proxies or CDNs in front of the files that strip `Access-Control-Allow-Origin` (the loader then runs but the player never loads — see the no-CORS errors above).

## Open questions for the developer

1. **CSS splitting tool:** add `@tsdown/css` (exact version must match tsdown) or keep an own ~30-line plugin? Rolldown alone cannot do CSS any more.
2. **CSS cache busting:** the CSS file takes the JS chunk hash, so a CSS-only fix keeps the old file name. Fine on versioned CDN paths; for other long-cache hosts, use unhashed names (`hash: false`) on versioned paths, or give CSS its own hash and pass it to the chunk.
3. **npm consumers and CSS:** a chunk finds its CSS from `import.meta.url`. When a consumer bundler re-bundles our ESM, `import.meta.url` is the consumer's chunk, so the CSS is not found. `@tsdown/css` `inject: true` adds `import './x.css'` to the chunk (read from its source, not run): good for bundlers, but a browser cannot load a CSS file as a module script, so it breaks the CDN path. Options: two ESM outputs (npm with inject, CDN without), or a literal `new URL('./chapters.css', import.meta.url)` with unhashed names (Vite/webpack copy it as an asset — not verified here). R-09 assumes one ESM output; this needs a decision.
4. **Version ranges on the CDN:** jsDelivr serves `@5/…` directly (7-day browser cache), so `currentScript.src` keeps the range and the loader and chunks can come from different releases after a release (hashed chunk 404 or shell/layer mismatch). unpkg redirects to the exact version. Should the loader pin its base to its own exact version when its URL has a range?
5. **Two TypeScripts:** the generator needs `typescript` < 7 (TS 7 has no JS API); TS 7 lives under the `typescript7` alias here, and `node_modules/.bin/tsc` points to TS 7 (both packages ship a `tsc` bin). v5 must keep both and call each by its path. Which package keeps the plain `typescript` name?
6. **Lint:** `--type-aware` needs `oxlint-tsgolint` (or `tsrs`), which R-01 counts on — approve that dependency or drop the flag? Where the `@internal` names live in Video.js 10.7.0 (TS 7 probe `cases/videojs-internal-names.ts`): `@videojs/html` exports all except `defineSlice` (it re-exports `@videojs/core/dom`); `@videojs/core` exports `definePlayerFeature`; `@videojs/core/dom` exports `definePlayerFeature` and `PlayerExtension`; `defineSlice` is in `@videojs/store` (not in the other three). So the ban lists `@videojs/html`, `@videojs/core`, `@videojs/core/dom` and `@videojs/store`, and must be updated when Video.js moves names. Patterns match the specifier text only: `**/player/**` misses `../player` and `**/player` misses `../player/index.js`, so the rings use regex patterns; a tsconfig `paths` alias would need its own entry. Any namespace import of `@videojs/html` is reported as a whole.
7. **Schema:** `@deprecated` comes out as a string (`"deprecated": "Use …"`), not the boolean of newer JSON Schema drafts. OK for `schema.json`, or post-process?
