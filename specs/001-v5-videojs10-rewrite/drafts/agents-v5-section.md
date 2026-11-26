# DRAFT — `AGENTS.md` section for the `v5` branch

> **Status: draft for review (D-26).** Not in force. When approved, this section is added to `AGENTS.md` on the `v5` branch. On `master` (v4), the current `AGENTS.md` stays unchanged.

---

## v5 branch (Video.js 10 rewrite)

On the `v5` branch, this section overrides the rules above where they conflict. The constitution (`.specify/memory/constitution.md`) is the source of the principles; this section is the day-to-day guide.

### Project knowledge

- **Tech stack:** TypeScript (strict), Video.js 10 (`@videojs/*`), hls.js and dash.js through the Video.js adapters, Google IMA SDK loaded at run time for ads. One build tool (see `research.md` R-01), Vitest (unit + browser mode), Playwright (three engines), axe.
- **Rings** (lint-enforced):
  - `src/core/` — Cloudinary logic. **Never import Video.js here.**
  - `src/shell/` — the ≤ 10 KB first load: `VideoPlayer`, factories, `<cld-video-player>`, lazy, schedule, poster.
  - `src/player/` — the only place that talks to Video.js 10.
  - `src/features/<name>/` — one lazy module per feature: `setup(ctx)` returns `teardown`. Features never import each other.
- **Contracts:** `specs/001-v5-videojs10-rewrite/contracts/` (public API, options, events, element, video service, distribution). Change them only with approval.

### Commands

```bash
npm run typecheck        # tsc --noEmit
npm run lint             # lint src and test
npm run test:unit        # core, Node
npm run test:browser     # shell, layer, features in Chromium/WebKit/Firefox
npm run test:e2e:smoke   # built CDN files, three engines (PR set)
npm run size             # size budgets
npm run build            # dist/ (never edit by hand)
```

Run the file-scoped form while working (`npm run test:unit -- <file>`); run all of the above before a PR.

### Boundaries

- **Always:** keep TypeScript strict; add or update a test with every behavior change; keep each option's single definition in `src/core/options/types.ts` (with `@default` and `@description`); render user strings with `textContent`; clean up in `teardown`; check size with `npm run size`.
- **Ask first:** a new dependency; any internal or undocumented Video.js 10 API (add a row to the "Internal API exceptions" list in `research.md` R-02); a change to a contract file; a change to a size budget; a new public option, method or event.
- **Never:** import Video.js in `src/core/`; use `innerHTML` with user data; hang shared state on the player object; add a second way to do something that already exists; edit `dist/`; accept secrets (`api_secret`, `sign_url`, `auth_token`) in options.

### Rules that change on `v5`

| v4 rule (above) | On `v5` |
|---|---|
| No TypeScript in `src` | TypeScript is required in `src`. |
| Minimize diffs; don't refactor unrelated code | Still applies to every PR; the rewrite itself is the approved plan, not a licence for unrelated changes. |
| Ask first: modifying webpack config | No webpack; ask first before changing the build tool configuration's output names or chunking. |
| Ask first: changing `package.json` exports | Still applies; exports are fixed by `contracts/distribution.md`. |
| Lint: `npm exec eslint src` | `npm run lint`. |
