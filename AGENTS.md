# AGENTS.md — cloudinary-video-player

Guidance for AI coding agents working **in this repo**. Human-facing "what is this / when to use" lives in [`README.md`](./README.md) — read its **For AI agents** section for package selection; this file is operational.

## What this package is (one line)
A browser-side HTML5 video player built on **Video.js** for delivering and customizing Cloudinary-hosted video — adaptive streaming (HLS/DASH), plugins, skins, analytics, and ads, shipped as both UMD and ESM builds.

## When to use this / when NOT to use this
- **Use this when:** you need to render and customize a video player for Cloudinary-hosted video on a web page.
- **Do NOT use this when:** you need analytics for any player (use `cloudinary-video-analytics`), standalone default profiles (`cloudinary-video-player-profiles`), browser delivery-URL building with no UI (`@cloudinary/url-gen`), or server-side upload/admin (`cloudinary` Node SDK).
- **Sibling packages are also dependencies here:** `cloudinary-video-analytics` and `cloudinary-video-player-profiles` ship inside this player; `@cloudinary/url-gen` builds the delivery URLs. Don't fork their logic into this repo — change them upstream.

## Your role
Expert engineer on a Video.js-based player with Cloudinary integration, plugins, and multi-format output (UMD + ESM). Write clean code that follows existing patterns. You can't see visual results — rely on user testing and say "please test this," not "this works."

## Setup
```bash
npm install
```
No credentials needed to build or test. The player takes a `cloudName` and `publicId` at runtime; tests use fixtures/mocks. `npm install` runs `prepare`, which copies `env.example.js` → `env.js`.

## Minimal runnable example
```html
<video id="player" controls class="cld-video-player cld-fluid" data-cld-public-id="dog"></video>
<link href="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/player.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/cloudinary-video-player/dist/player.min.js"></script>
<script>
  cloudinary.videoPlayer('player', { cloudName: 'demo', publicId: 'cld-sample-video' });
</script>
```
ESM equivalent: `import cloudinary from 'cloudinary-video-player'` + `import 'cloudinary-video-player/player.min.css'`.

## Build / test commands (run these after editing)
Prefer file-scoped commands; full builds are slow.
```bash
npm run lint            # eslint src
npm run test:unit       # Vitest unit suite (.config/vitest.config.ts test/unit)
npx vitest run --config .config/vitest.config.ts test/unit/path/to/file.test.js  # single file
npm run test:e2e        # Playwright e2e (test/e2e) — use sparingly, slow
npm test                # jest --no-cache --detectOpenHandles (the package "test" script)
npm run build           # UMD min bundle (webpack); build-es = ESM (rollup); build-all = everything
```
Notes:
- `npm run test:unit` (Vitest) is the fast inner loop for `src/` changes. `npm test` runs the Jest suite; both exist — match the suite that covers the code you touched.
- `postbuild-all` runs **bundlewatch**: `dist/player.min.js` ≤ 10kb, `dist/player-full.min.js` ≤ 140kb. Watch bundle size when adding code or deps.

## File structure
- `src/` — source (JS, no TS in src). Entry: `src/index.js`; player: `src/video-player.js`.
- `src/plugins/` — Video.js plugins (cloudinary, playlist, chapters, adaptive-streaming, ads, …).
- `src/components/` — UI components. `src/utils/` — shared helpers (centralize duplicated logic here).
- `dist/` — UMD bundles (CDN/legacy). `lib/` — ESM output (tree-shakeable). **Both generated — never edit.**
- `test/unit/` — Vitest. `test/e2e/` — Playwright. `types/cld-video-player.d.ts` — hand-maintained types. `docs/` — demo pages.

## Conventions & gotchas
- **ESLint** (`eslint src`); commit messages via **commitlint** (Conventional Commits). `precommit` runs lint; Husky hooks are wired.
- **Never edit `dist/` or `lib/`** — they're build output. Update `types/cld-video-player.d.ts` when the public API changes.
- **Tree-shake imports:** `import get from 'lodash/get'`, not `import _ from 'lodash'`. Avoid heavy deps for trivial needs — bundlewatch will fail the build.
- **Minimize diffs.** Touch only code for the task; don't fix unrelated lint or refactor "while you're there." Prefer deleting code over adding it.
- **Trust normalization** — don't scatter defensive `|| fallback` checks; fix the source where the value should be set.
- **Boundaries — ask first:** adding dependencies, changing `webpack`/`package.json exports`, major refactors. **Never:** commit secrets, edit generated dirs.
- **Suggest tests** for new features; search `test/unit/` and `test/e2e/` first to avoid duplicating coverage. Remove debug logs before committing.

## Canonical docs (leave the repo for depth)
- Player docs: https://cloudinary.com/documentation/cloudinary_video_player
- API reference: https://cloudinary.com/documentation/video_player_api_reference
- Code examples: https://cloudinary.github.io/cloudinary-video-player/
- Video Player Studio (visual config): https://studio.cloudinary.com/
- MCP servers (agent/no-code path): https://github.com/cloudinary/mcp-servers

## Agent / MCP note
This is a UI library — agents generate integration code with it. For autonomous, no-code Cloudinary task execution (upload, transform, manage), prefer the Cloudinary MCP servers and use this package for the player code itself. See cloudinary/mcp-servers.

## PR checklist
- `npm run lint` clean on changed files; relevant unit/e2e tests pass.
- Diff small and focused; no debug logs or generated-file edits; bundle within bundlewatch limits.
- Commit message follows Conventional Commits (commitlint enforces it).
