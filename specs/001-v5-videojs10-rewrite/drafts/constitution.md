# DRAFT — Cloudinary Video Player v5 Constitution

> **Status: draft for review (D-26).** Not in force. When approved, it replaces the empty template at `.specify/memory/constitution.md` on the `v5` branch. Until then, the current `AGENTS.md` rules apply.

## Core Principles

### I. A standalone Cloudinary core

Cloudinary logic (options, media URLs, poster, tracks, video service, playlists data, analytics payloads) lives in `src/core/` and imports nothing from Video.js. The layer (`src/player/`) connects the core to Video.js 10 through **public, documented** Video.js APIs only. Any use of an internal or undocumented Video.js API needs an entry in the "Internal API exceptions" list (`research.md` R-02), with the reason and the removal plan.

*Rationale:* v4 was coupled to Video.js 8 internals, which made the Video.js 10 move a rewrite. The core must survive the next one.

### II. Compatible by default, breaking on purpose

v4 option names and shapes, the four factory functions, the CDN file names and the `window.cloudinary` global keep working. Every break is deliberate: it has a row in the migration guide and, where the code can detect it, a debug message that names the replacement. "Improve what is possible, avoid breaking customer pages."

### III. Small by default

The lazy shell stays at or below 10 KB gzip. The default player and every optional feature have a size budget that CI enforces on every pull request. Features load only when their option is used. No dependency is added for something a few lines of code can do.

### IV. One way to do each thing

One options definition (types → validation → `schema.json` → docs). One normalization at entry. One URL builder. One video-service client. One rename table. One typed public event list. A second way to do something that already exists is a defect.

### V. Plain data and explicit lifecycles

Sources and options are immutable values built by pure functions. Every feature has `setup` and `teardown`, reacts to source changes, and leaves nothing behind (listeners, timers, observers, elements, polling). State is never shared by hanging fields on the player object.

### VI. Accessible, private and safe

WCAG 2.2 AA in every skin: keyboard operable, visible focus, accessible names, sufficient contrast. User-supplied strings are rendered as text, never as HTML. No secrets in the browser. With default options, no request goes to a host other than Cloudinary's and the page's own.

### VII. Tests that prove behavior

URL generation is proven against golden fixtures recorded from v4. Behavior that needs a real browser is tested in a real browser (unit tests in browser mode; end-to-end on Chromium, WebKit and Firefox). Every audit defect has a test or a "not applicable" note. A pull request that changes behavior changes a test.

## Constraints

- TypeScript (strict) in `src/`; ESM only on npm; classic loader scripts on the CDN.
- Supported: Safari/iOS 16.4+, Chrome/Edge 111+, Firefox 121+, iOS WKWebView and Android System WebView at the same engines. Nothing older.
- Generated output (`dist/`) is never edited by hand.

## Workflow

- Every change starts from a Jira VIDEO ticket and follows the `.sherpa` flow (ticket → plan → spec → implement → test → docs → PR).
- Pull requests pass: type check, lint, unit and browser tests, size budgets, and the end-to-end smoke set. The full end-to-end matrix runs before every release.
- Public contract files (`specs/001-v5-videojs10-rewrite/contracts/`) change only with the Video team's approval.

## Governance

This constitution overrides other practice documents on the `v5` branch. Amendments are made by pull request, approved by the Video team, and versioned (MAJOR: a principle removed or redefined; MINOR: a principle added; PATCH: wording). Reviews check compliance; any exception is recorded in the plan's Complexity Tracking table.

**Version**: 0.1.0 (draft) | **Ratified**: — | **Last Amended**: 2026-11-11
