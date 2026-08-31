@AGENTS.md

# CLAUDE.md — cloudinary-video-player

## Claude Code-specific notes

**Primary reference:** `AGENTS.md` (imported above) covers setup, build/test commands, file structure, conventions, and gotchas. Read it before touching any file.

## What this repo is

`cloudinary-video-player` is the **browser-side HTML5 video player** built on **Video.js** for delivering and customizing Cloudinary-hosted video — adaptive streaming (HLS/DASH), plugins, skins, analytics, and ads. It ships as both UMD (`dist/`) and ESM (`lib/`) builds. It's a UI library: you generate integration code with it, not autonomous Cloudinary operations.

## Key constraints

- **Source is JS, not TS.** Entry point `src/index.js`; the player is `src/video-player.js`. Hand-maintained types live in `types/cld-video-player.d.ts` — update them when the public API changes.
- **Never edit `dist/` or `lib/`.** Both are build output (UMD and ESM). Edit `src/` and rebuild.
- **Two test suites, both real.** `npm test` runs **Jest**; `npm run test:unit` runs **Vitest** (the fast inner loop for `src/`). Match the suite that covers the code you touch — don't assume one.
- **Bundle size is enforced.** `postbuild-all` runs bundlewatch (`dist/player.min.js` ≤ 10kb, `dist/player-full.min.js` ≤ 140kb). Tree-shake imports (`import get from 'lodash/get'`, not `import _ from 'lodash'`) and avoid heavy deps.
- **Conventional Commits** enforced by commitlint; `precommit` runs lint via Husky.
- **Sibling packages ship inside this player:** `cloudinary-video-analytics` and `cloudinary-video-player-profiles` are dependencies, and `@cloudinary/url-gen` builds the delivery URLs — change those upstream, don't fork their logic here.

## Verified build/test commands

```bash
npm install                # runs prepare → copies env.example.js to env.js

npm run lint               # eslint src
npm run test:unit          # Vitest unit suite (.config/vitest.config.ts test/unit) — fast inner loop
npm test                   # jest --no-cache --detectOpenHandles (the package "test" script)
npm run test:e2e           # Playwright e2e (test/e2e) — slow, use sparingly
npm run build              # UMD min bundle (webpack)

# Single unit file (Vitest):
npx vitest run --config .config/vitest.config.ts test/unit/path/to/file.test.js
```

No credentials are needed to build or test — the player takes `cloudName` and `publicId` at runtime, and tests use fixtures/mocks.
