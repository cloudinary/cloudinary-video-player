# Contract: distribution (CDN, npm, DOM and CSS surface)

**Requirements**: FR-002, FR-031, FR-032, FR-007, SC-007. **Decisions**: D-06, D-23, D-24.

## CDN (jsDelivr / unpkg, `dist/`)

| File | Kind | Contract |
|---|---|---|
| `player.min.js` | Classic script (IIFE), ≤ 10 KB gzip | Sets `window.cloudinary` with `videoPlayer`, `videoPlayers`, `player`, `players`; registers `<cld-video-player>`; renders the lazy shell (poster + play button); loads the ESM chunks by dynamic `import()` from **its own folder** (resolved from `document.currentScript.src`, never the page URL). |
| `cld-video-player.min.js` | Classic script | Same file content as `player.min.js` (in v4 it was the full bundle; in v5 every name is the loader). |
| `player-full.min.js` | Classic script | Same file content as `player.min.js` (v4 full bundle; kept as a loader copy, decided 2026-11-12). |
| `player.min.css`, `cld-video-player.min.css` | CSS | Same content: shell + default skin (v4 look, dark and light). Feature CSS loads with its chunk. |
| `chunks/*.js`, `chunks/*.css` | ESM chunks | Content-hashed names. **Not** a public contract (D-06: "lazy chunk names may change"). |
| `fonts/inter-*.woff2` | Font | Default font (FR-041). Not counted in the JS/CSS budget; loaded with `font-display: swap`. |
| `schema.json` | JSON | Generated options schema (FR-007). |

**Removed** (migration guide): `cld-video-player.light(.min).js`, every non-minified copy, the named v4 lazy chunks (`adaptive-streaming.js`, `ima.js`, `playlist.js`, …). `player-full.min.js` stays as a loader copy (decided 2026-11-12).

**Loading rule.** A page with the v4 README snippet (`<link player.min.css>`, `<script player.min.js>`, `cloudinary.videoPlayer('id', {...})`) works unchanged (FR-002, SC-001). The script works with `defer`/`async` too; calls made before the chunks load are queued (`contracts/public-api.md`).

## npm (`cloudinary-video-player`)

```jsonc
{
  "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./cld-video-player.min.css": "./dist/cld-video-player.min.css",
    "./schema.json": "./dist/schema.json"   // decided 2026-11-12 (amends D-24)
  },
  "sideEffects": ["*.css"]
}
```

- ESM only; no `require` condition (D-23). CommonJS users get Node's `ERR_REQUIRE_ESM`-style error; the migration guide covers it.
- `.` exports the four factory functions, the `CldVideoPlayer` element class, `defineElement()`, and the public types. Importing `.` does **not** register the custom element; npm users call `defineElement()` once, and the CDN loader calls it for them. *(Rationale: no side effects on import, safe in server-side rendering, tree-shakeable; research R-10.)*
- Optional features are internal dynamic imports, loaded from options (D-24). No per-feature export paths unless a tree-shaking spike proves one is needed.
- Peer dependencies: none. Video.js 10 packages and adapters are regular dependencies, bundled into our chunks (one copy, version-pinned).

## DOM and CSS surface (migration guide input)

| Surface | v4 | v5 |
|---|---|---|
| Root class | `.cld-video-player`, `.cld-video-player-{id}` | `.cld-video-player` kept on the root; per-id class removed. |
| Skin class | `.cld-video-player-skin-dark` / `-light` | Kept. |
| Fluid class | `.cld-fluid` | Kept. |
| Color variables | `--color-base`, `--color-accent`, `--color-text` | Kept as the public theming API; mapped to the Video.js 10 variables (`--media-accent-color`, …) inside the skin. |
| Video.js classes | `.vjs-*` (72 overrides in v4 CSS) | **Gone.** Customer CSS that targets `.vjs-*` breaks; the guide lists the replacement parts/selectors. |
| Inner `<video>` id | `{id}_html5_api` | Gone. |
| Fonts | Google Fonts request | Inter from Cloudinary (FR-041, SC-013). |
| Icons | Icon font (base64 "VideoJS") | Inline SVG (D-20). |

## Budgets (FR-032, SC-007; enforced in CI)

See `plan.md` → "Size budgets".
