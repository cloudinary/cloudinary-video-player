# v5 dilemmas — answered

Each item has context, options, the original recommendation and the developer's answer. All 30 were answered between 2026-10-22 and 2026-11-11, one by one in chat; `log.md` has the reasoning.

| # | Topic | Recommended | Answer |
|---|---|---|---|
| D-01 | Feature list for 5.0 | See the table | Remove Interaction areas + Shoppable; keep AI highlights, context menu, GA; generic overlay plugin; 360 → 5.x |
| D-02 | Saved server configs | A: read as stored, map renames | A (owner: Video team) |
| D-03 | Cloudinary products that host the player | List and owners | All hosts use npm; each moves after GA; owners open |
| D-04 | v4 maintenance | A: 12 months after 5.0 | B: 6 months |
| D-05 | Framework wrappers | A: none in 5.0 | A |
| D-06 | CDN contract | A: keep main names and global | A; announce at GA only |
| D-07 | Start functions | A: one factory, sync object | Keep v4 shapes; `videoPlayer()` skips server config; `Cloudinary.new()` removed |
| D-08 | Per-asset config fetch | A: keep, do not block poster | On; saved poster from video-elements for all; video service = one module |
| D-09 | Option names and attributes | A: v4 names, one normalization | A + native media attributes |
| D-10 | URL building | A: own small builder | A |
| D-11 | Option definitions | A: types are the source | A |
| D-12 | Events | A: keep documented v4 events | A |
| D-13 | Ads scope | A: v4 parity on IMA | A, nothing beyond v4 |
| D-14 | Analytics | A: keep Cloudinary, trim usage report, drop GA | Minimal usage report; GA kept (opt-in); approver: PM |
| D-15 | Default font | A: system font | B: Inter, self-hosted |
| D-16 | Secrets in options | A: remove | A, always warn |
| D-17 | Remote profiles | A: https + validate | C: keep v4 behavior |
| D-18 | Streaming engine | A: hls.js + dash adapter | A; customers use AES HLS / TS live |
| D-19 | Skin and design | A: v10 skin restyled to v4 look | A (v4 look default) + other v10 skins if cheap |
| D-20 | Icons | A: SVG | A |
| D-21 | Size budget | A: 60 KB default | Principle; shell ≤ 10 KB; plan sets budgets |
| D-22 | Repo and branch | A: same repo, `v5` branch | A |
| D-23 | Build and bundles | A: one tool, ESM + CDN loader | A (ESM only) |
| D-24 | npm exports | A: `.` + CSS only | A |
| D-25 | Tests | A: parity tests first | Re-think in the plan; own devices |
| D-26 | Repo rules and principles | A: v5 section + constitution | A (drafts for review) |
| D-27 | Browsers below the floor | A: native video fallback | C: do nothing |
| D-28 | Timeline and team | No recommendation | No date yet; Video team; no deadlines |
| D-29 | Jira epic | Approve draft | Text approved; create with child tasks |
| D-30 | Access to the inner player (`player.videojs`) | B: documented, limited access | A, minimal: raw v10 player as hatch |

---

## Scope and compatibility

### D-01 · Feature list for 5.0

5.0 ships every feature marked Keep, Merge or Replace. Core media delivery (transformations, source types, breakpoints, crop, HDR, raw URLs, audio, live, errors) is always in and not listed.

| Feature | v4 option | In Video.js 10? | Recommended | Why | Your call |
|---|---|---|---|---|---|
| Adaptive streaming, quality menu, audio tracks | `sourceTypes` hls/dash, `adaptiveStreaming` | Yes | Keep (v10 adapters) | Core value | |
| ABR strategy | `adaptiveStreaming.strategy` | No | Keep if the adapter allows it, else remove with notice | Low usage likely | |
| Seek thumbnails | `seekThumbnails` | Yes | Keep (v10) | Built in | |
| Chapters | `chapters`, `chaptersButton` | Partly (segments, no menu) | Keep (v10 + chapter label) | Demoed, used | |
| AI highlights graph | `aiHighlightsGraph` | No | Remove | Default off, copy of thumbnail code, hard-coded color | |
| Captions: SRT, transcripts, word highlight, styles | `textTracks` | Partly | Keep | Top customer topic | |
| Title and description | `title`, `description`, `info` | Yes | Keep (v10) | Built in | |
| ±10 s jump buttons | `showJumpControls` | Yes | Keep (v10) | Built in | |
| Picture-in-picture button | `pictureInPictureToggle` | Yes | Keep (v10) | Built in | |
| Logo button | `showLogo`, `logoImageUrl`, `logoOnclickUrl` | No | Keep | Small, branded | |
| Colors | `colors` | Partly (CSS variables) | Keep (CSS variables only) | No separate chunk needed | |
| Dark/light skins | `skin` | Partly | Keep (D-19) | Visible contract | |
| Custom font | `fontFace` | Partly | Keep, opt-in (D-15) | Privacy | |
| Big play button only at start | `bigPlayButton: 'init'` | Unknown | Keep | Cheap | |
| Mobile big pause button | automatic | Unknown | Replace with v10 mobile controls | Avoid custom UI | |
| Playlist, by tag, auto-advance, next/prev | `playlist()`, `playlistByTag()` | No | Keep | Widely used | |
| Playlist widget (vertical, horizontal, custom) | `playlistWidget` | No | Keep | Used in demos | |
| Upcoming-video overlay | playlist options | No | Merge into one "next up" component | Overlaps recommendations | |
| Recommendations end screen | `recommendations`, `autoShowRecommendations` | No | Merge (with upcoming overlay) | Same job | |
| Ads | `ads` | No | Keep (decided) | Monetization | |
| Shoppable | `shoppable` | No | Keep, rewrite | Actively developed | |
| Interaction areas | `interactionAreas`, `interactionDisplay` | No | Remove | Many bugs, hard-coded prod URLs, first source only, not keyboard accessible | |
| Download button ("share" plugin) | `download` | No | Keep, rename internally | Useful, small | |
| Source switcher | `videoSources` | No | Keep | Small | |
| Floating player | `floatingWhenNotVisible` | No | Keep, rewrite | PiP needs a user gesture, so it is not a replacement | |
| Autoplay on scroll | `autoplayMode: 'on-scroll'` | No | Keep | Small | |
| Context menu | `hideContextMenu` | No | Remove | Duplicates the control bar | |
| Google Analytics plugin | `analytics` | No | Remove (D-14) | Events recipe does the same | |
| Cloudinary analytics | `cloudinaryAnalytics` | No | Keep | Product data | |
| Lazy loading | `lazy` | No | Keep | Performance | |
| Schedule | `schedule` | No | Keep, fix activation | Broken today | |
| Profiles | `profile` | No | Keep (D-02) | Console/Studio | |
| Played-percent / time events | `playedEventPercents`, `playedEventTimes` | No | Keep | Analytics | |
| Cloudinary error messages | automatic | Partly (error dialog) | Keep (v10 dialog, our messages) | Support load | |
| Debug mode and validation | `debug` | No | Keep (from D-11 definitions) | Migration aid | |
| 360 demo | none (plugin not in repo) | No | Remove the demo | Does not work today | |

Usage data per feature, if you have it: `____`

**Answer (2026-10-22):**
- **Remove:** Interaction areas, **Shoppable** (developer's addition). The 360 demo is out of 5.0 and tracked for 5.x: Video.js 10 has no 360 support, `videojs-vr` works only with Video.js 6/7, and a renderer would need undocumented v10 APIs.
- **Keep (against the recommendation):** AI highlights graph, Context menu, Google Analytics plugin.
- **Upcoming overlay + recommendations:** build a **generic overlay plugin** for overlays on the video, and implement the upcoming-video overlay and the recommendations end screen on top of it.
- **ABR:** keep hls.js and our strategy presets (fastStart, balanced, highQuality) and the HDR preference, passed to the Video.js 10 hls.js adapter (`source.engine.hlsJs`, `.engine` for the Hls instance). No custom hls.js wrapper. Note: set size capping through the adapter's own options (`capRenditionToPlayerSize`, `maxAutoResolution`), not hls.js `capLevelToPlayerSize`.
- **Rest of the table:** accepted. Guiding principle: **smallest possible bundle**, so optimize wherever we can.

### D-02 · Saved server configs

`player()` loads named profiles and, by default, a per-asset config from Cloudinary servers. Console and Studio write them with v4 option names.

- **A.** v5 reads them as stored. One mapping table converts renamed options. The migration guide uses the same table.
- **B.** The servers move to a v5 format and serve both versions.
- **C.** v5 drops server configs.

**Recommended:** A. Configs stay close to v4 anyway, so the mapping table stays small, and it needs no server work.
**Owner of the server format:** Video team

**Answer (2026-10-22):** A — v5 reads saved profiles and per-asset configs as stored; one mapping table converts renamed options and feeds the migration guide. Owner of the server format: our team (Video).

### D-03 · Cloudinary products that host the player

Console preview, Video Player Studio and the embedded player page (`embedded-iframe` demo) use this player. They can break or pin versions.

**Recommended:** list each product, its owner and how it loads the player. Each product stays on v4 until v5 GA, then moves in a planned step.

**Answer (2026-10-22):** Hosts: Console (media preview), Video Player Studio, embedded player page, SDKs and widgets, tx-builder, canvas, image-to-video and others. All load the player as an npm dependency (pinned in their own builds), so none gets v5 by accident. Each stays on v4 until v5 GA, then moves in a planned step. Owner per product: open item for the plan.

### D-04 · v4 maintenance after 5.0

Video.js 8 receives security fixes until 2028-10-01.

- **A.** Security and critical fixes for 12 months after 5.0 GA.
- **B.** 6 months.
- **C.** Security fixes only, until Video.js 8 support ends.

**Recommended:** A. It gives WebView/TV/old-browser customers time without long double work.

**Answer (2026-10-22):** B — security and critical fixes for 6 months after 5.0 GA.

### D-05 · Framework wrappers

- **A.** None in 5.0. The custom element works in React 19, Vue and Svelte, so we document that usage.
- **B.** A React wrapper in 5.0.

**Recommended:** A. Not part of v4, so it is outside the parity scope. Add in 5.x if customers ask.

**Answer (2026-10-22):** A — no wrappers in 5.0; document custom-element usage in React 19, Vue and Svelte. Add in 5.x if customers ask.

---

## API and configuration

### D-06 · CDN contract

v4 publishes `dist/player.min.js|css`, `cld-video-player.min.js|css`, `cld-video-player.light.min.js`, non-minified copies and named lazy chunks, and sets `window.cloudinary`.
**Warning:** jsDelivr URLs without a version (as in the README) load v5 on release day.

- **A.** Keep `player.min.js|css`, `cld-video-player.min.js|css` and the global. Remove `.light` and the non-minified copies. Lazy chunk names may change.
- **B.** Keep every file name.
- **C.** New names only.

**Recommended:** A. The README snippet keeps working, and unpinned users get a working player.
**Also decide:** do we announce, and recommend version pinning, before GA? At GA only.

**Answer (2026-10-22):** A — keep player.min.js|css, cld-video-player.min.js|css and window.cloudinary; remove .light and non-minified copies; lazy chunk names may change. Announcement: at GA only (5.0 release notes), no pre-GA notice.

### D-07 · How a player starts

v4 has `videoPlayer`, `videoPlayers`, `player`, `players` and `Cloudinary.new`, with four return shapes (instance, proxy, two promises).

- **A.** One factory. It returns the player object at once. Async setup (profile, config, lazy, chunk loading) happens inside, and `player.ready` is a Promise. `videoPlayer`, `videoPlayers` and `players` stay as aliases. `Cloudinary.new` is removed.
- **B.** Keep the v4 behavior per function.
- **C.** Only an async `player()` that returns a Promise.

**Recommended:** A. The v4 snippet and `player.source(...)` calls keep working, and there is one return shape.

**Answer (2026-10-22):** Modified B — keep the v4 shapes. player()/players() get the server config (profile + per-asset config), then return a Promise. videoPlayer()/videoPlayers() return a real player at once (no proxy) and do not get the server config (exact v4 behavior). Cloudinary.new() is removed. Principle: improve what is possible, avoid breaking customer pages.

### D-08 · Per-asset config request on by default

By default, `player()` asks Cloudinary for a per-asset config before the first frame. That is one extra round trip, and most assets have no config.

- **A.** Keep it on by default (parity). Show the poster at the same time and do not block on the request.
- **B.** Off by default. Turn it on with an option, or when a hosting product (D-03) asks for it.
- **C.** Keep the v4 behavior.

**Trade-off:** a per-asset config can change transformations, so with A the poster can change once the config arrives.
**Recommended:** A, then revisit with data. Removing it silently would break settings saved in Console.

**Answer (2026-10-22):** Modified A — the per-asset config request stays on for player(). Both player() and videoPlayer() start with the video-elements poster service URL by default when no explicit poster is set (it redirects to the saved poster, or to the default still), so the poster shows at once and does not flash when the config arrives. Also: the video service (/_applet_/video_service/: profiles, video-config, elements, chapters, transcription, video_metadata) becomes one module in the v5 core that every feature uses.

### D-09 · Option names and HTML attributes

v4 accepts snake_case and camelCase cloud settings in three places, and turns every HTML attribute (even `class`, `id`) into an option.

- **A.** Keep the v4 option names. Cloud settings accept `cloud_name` and `cloudName`, at the top level or in `cloudinaryConfig`, and are normalized once at entry. Only `data-cld-*` attributes (and the custom element's attributes) become options.
- **B.** camelCase only.
- **C.** Keep everything as in v4.

**Recommended:** A. Configs stay close to v4, and internally there is one form.

**Answer (2026-11-08):** A, with a correction — keep v4 option names; cloud settings accept cloud_name and cloudName, at the top level or in cloudinaryConfig, normalized once at entry. HTML options come from data-cld-* attributes plus the native media attributes (autoplay, muted, loop, controls, playsinline, preload, poster); class, id and style stop becoming options. The custom element reads its own attributes.

### D-10 · URL building

v4 uses only the legacy compatibility layer of `@cloudinary/url-gen`, plus hand-built strings in other places.

- **A.** Our own small URL builder in the core. It accepts v4 transformation objects (snake_case keys, arrays for chains) and raw transformation strings. The 64-case URL test set proves parity.
- **B.** Keep the url-gen legacy layer.
- **C.** Move to the modern url-gen API (it changes the input format).

**Recommended:** A. Smaller, one place for all URLs, and the input format stays the same.

**Answer (2026-11-08):** A — our own small URL builder in the core; accepts v4 transformation objects (snake_case keys, arrays for chains) and raw strings; must cover every key v4 accepts, including variables and if-conditions; the 64-case URL test set proves parity.

### D-11 · Where options are defined

Today the types say `any`, and the JSON schema has drifted from the defaults.

- **A.** The TypeScript types are the source. We generate the JSON schema (for Studio/Console and debug validation) and the option docs from them.
- **B.** The JSON schema is the source, and we generate the types.
- **C.** Maintain both by hand.

**Recommended:** A.

**Answer (2026-11-08):** A — the TypeScript types are the source; schema.json (still published in dist/ and lib/) and the option docs are generated from them.

### D-12 · Events

v4 mixes Video.js events, Cloudinary events and internal events (about 30). `playerload` never reaches listeners.

- **A.** Keep the documented v4 public events and payloads. Drop the internal ones. Publish one event list.
- **B.** A new event model based on Video.js 10 state.

**Recommended:** A. Customer code keeps working.

**Answer (2026-11-08):** A — keep the documented v4 public events and payloads; drop internal events; publish one typed event list.

### D-13 · Ads scope

v4 plays ads through Google IMA (VAST, VPAID) with the `ads` options.

- **A.** Parity with the v4 `ads` options on the Google IMA SDK, with the same ad UI and ads in playlists. VPAID is supported only as far as the IMA SDK still supports it.
- **B.** A plus server-side ad insertion (out of v4 scope).

**Recommended:** A.
**Ad features customers need beyond v4:** none — keep it simple.

**Answer (2026-11-08):** A — v4 parity on the Google IMA SDK: same ads options, our own small IMA integration (replaces videojs-ima + videojs-contrib-ads), IMA's ad UI, ads in playlists; VPAID only as far as IMA supports it. No features beyond v4; keep it simple.

---

## Privacy and security

### D-14 · Analytics

Three pipelines today:
- Cloudinary analytics (on by default).
- An internal usage report on every source change. It sends option data, including titles, descriptions and URLs.
- The Google Analytics plugin (opt-in).

- **A.** Keep Cloudinary analytics as in v4. Keep the usage report, but send only the minimum (version, cloud name, features in use; no titles, descriptions or URLs). Remove the GA plugin, and document a recipe built on player events.
- **B.** Keep all three as in v4.

**Recommended:** A.
**Who approves the data list (privacy/legal)?** Product manager.

**Answer (2026-11-08):** Modified A — keep Cloudinary analytics as in v4 (on by default); the usage report sends only the minimum (version, cloud name, features in use; no titles, descriptions or URLs); the GA plugin stays opt-in (kept per D-01, not removed). Approver of the data list: product manager.

### D-15 · Default font

v4 loads Google "Inter" by default, which is a third-party request on every player.

- **A.** Use the system font by default. `fontFace` still loads a named font when the integrator sets it.
- **B.** Keep Inter by default, self-hosted on Cloudinary.
- **C.** Keep the v4 behavior.

**Recommended:** A. No third-party requests by default, and a faster start.

**Answer (2026-11-08):** B — keep Inter as the default font, self-hosted on Cloudinary (no Google request); fontFace still loads a named font when set.

### D-16 · Secrets in options

v4 accepts `api_secret`, `sign_url` and `auth_token`, but never signs URLs.

- **A.** Remove them. Debug mode warns if they are passed, and the docs point to server-side signing.
- **B.** Keep accepting and ignoring them.

**Recommended:** A.

**Answer (2026-11-08):** A, stricter — remove api_secret, sign_url and auth_token; always show a console warning when they are passed (not only in debug mode); docs point to server-side signing and signed public IDs/URLs.

### D-17 · Remote (raw-URL) profiles

A profile can be any URL, and its JSON is merged into the options (ad tags, logo links).

- **A.** Keep them, https only. Validate against the option definitions and drop unknown keys.
- **B.** Allow only profiles hosted by Cloudinary.
- **C.** Keep the v4 behavior.

**Recommended:** A.

**Answer (2026-11-08):** C — keep the v4 behavior: a profile can be any URL, and its JSON is merged into the options.

---

## Media and UI

### D-18 · Streaming engine and formats

Video.js 10 offers:
- an hls.js adapter (large);
- its own small engine, SPF (about 12 KB; fMP4 only; no TS, AES or ads);
- a dash.js adapter;
- Shaka for DRM.

Cloudinary VOD HLS/DASH is fMP4 with muxed audio and video (checked on the demo account). Live and encrypted formats are not checked yet.

- **A.** hls.js for all HLS and the dash adapter for DASH. Test SPF for VOD after 5.0.
- **B.** SPF for VOD and hls.js for live in 5.0.
- **C.** Also drop DASH.

**Recommended:** A. Parity first, lowest risk. DRM stays out of scope, as in v4.
**Do customers use AES-encrypted HLS or TS live streams?** Yes.

**Answer (2026-11-09):** A — hls.js adapter for all HLS (lazy-loaded) and the dash adapter for DASH; test SPF for VOD after 5.0; DRM stays out of scope. Customers do use AES-encrypted HLS or TS-segment live streams, so hls.js stays even if SPF is added later.

### D-19 · Skin and visual design

In Video.js 10, the control layout changes only if we copy a skin into our repo. It has 8 CSS variables and no runtime theme switch. v4 has dark/light skins and `colors` (base, accent, text).

- **A.** Copy one v10 skin as our base and restyle it to the v4 look. Keep dark and light. Map `colors` to CSS variables.
- **B.** A new design (needs a designer and a design review).
- **C.** The v10 default skin as is, plus colors.

**Recommended:** A. Visual parity, with less to decide.
**Is there a designer or Figma for v5?** No.

**Answer (2026-11-09):** A, extended — eject one v10 skin and restyle it to the v4 look; this is the default. Small improvements are welcome. Keep dark and light; map colors to the CSS variables. Also offer the other v10 skins through the skin option (each lazy-loaded) if it does not add much complexity; the plan checks the cost, and if it is high they move to 5.x. No designer or Figma for v5.

### D-20 · Icons

- **A.** SVG icons: the v10 icons plus our custom ones (from `src/assets/icon-font/custom-icons`). Remove the icon font.
- **B.** Keep the icon font.

**Recommended:** A.

**Answer (2026-11-09):** A — SVG icons: the v10 icons plus our custom ones (from src/assets/icon-font/custom-icons); remove the icon font.

### D-21 · Size budget

v4 full is about 140 KB compressed, without a streaming engine. The Video.js 10 HTML player is about 25 KB, and hls.js adds about 140 KB.

- **A.** Default player (code and styles, no streaming engine, no ads) ≤ 60 KB compressed, and each optional feature ≤ 15 KB. Every build checks the budgets.
- **B.** ≤ 70 KB (half of v4, the spec's default).
- **C.** Other: `____`

**Recommended:** A.

**Answer (2026-11-09):** Principle, no fixed number — keep the JS small and performant. Keep the tiny lazy shell (poster, click to load the player); v4 entry player.min.js is ≤ 10 KB in bundlewatch, and v5 stays at or below that. The plan proposes the core and per-feature budgets, starting from A (≤ 60 KB core, ≤ 15 KB per feature), and every build checks them.

---

## Engineering

### D-22 · Repo and branch

- **A.** Same repo and same npm name, with a long-lived `v5` branch. master stays v4 until GA, and small PRs go into `v5`. One package, with internal folders (core, adapter, ui, features).
- **B.** A monorepo with separate packages.
- **C.** A new repo.

**Recommended:** A. A monorepo has no user yet (YAGNI).
Note: this spec is on `fix/VIDEO-21243-format-opt-out`, and `specs/` is untracked. It moves to the `v5` branch.

**Answer (2026-11-09):** A — same repo and npm name; long-lived v5 branch; master stays v4 until GA; small PRs into v5; one package with internal folders (core, adapter, ui, features). The spec files move to the v5 branch.

### D-23 · Build and bundles

Today: webpack (UMD) plus rollup (ESM), minified and non-minified copies, lazy and full bundles, and a 1 MB proxy chunk in `lib/`.

- **A.** One build tool (Vite library mode or tsdown) and one ESM build for npm. For the CDN, a small classic script sets `window.cloudinary` and loads ESM chunks with dynamic import (all supported browsers can do this). No separate "full" bundle.
- **B.** Keep a UMD full bundle next to ESM.

**Recommended:** A.

**Answer (2026-11-09):** A — one build tool (Vite library mode or tsdown; the plan picks) and one ESM build for npm. For the CDN, the D-06 file names are small classic scripts that set window.cloudinary and load ESM chunks with dynamic import. No separate full bundle and no UMD; npm users that use CommonJS require() must move to ESM (migration guide).

### D-24 · npm exports

- **A.** Keep `.` (factory and element) and the CSS file. Remove `./*`, `./light/*`, `./videoPlayer`, `./player`, `./all`, `./full`, `./dash` and `./debug`.
- **B.** Keep the aliases for one major version.

**Recommended:** A. `./*` exposes every internal chunk today.

**Answer (2026-11-09):** A — keep . (factory and element) and the CSS file; remove ./*, ./light/*, ./videoPlayer, ./player, ./all, ./full, ./dash and ./debug. Features load on demand from options; the plan can add one path per feature if tree-shaking needs it.

### D-25 · Tests

- **A.** Port the behavior tests first, as parity tests (64 URL cases, schedule, poster, breakpoints, 19 validator cases), and delete the old jest/puppeteer suite. Write new Playwright e2e for each demo page in Chromium, WebKit and Firefox. Run WebView checks on real devices (or a device cloud) for each release candidate. Fix `npm run lint`.
- **B.** Other: `____`

**Recommended:** A.
**Do we have a device cloud (BrowserStack, Sauce Labs)?** No — own devices.

**Answer (2026-11-09):** Re-think — the developer wants a new test layer that follows a modern standard and strategy; CI must be impactful and performant. The plan proposes the strategy (layers, tools, what runs on each PR vs. release) for review. Fixed inputs: the spec's parity criteria (64 URL cases etc.) stay; the jest/puppeteer suite goes; WebView checks on the team's own devices per release candidate (no device cloud).

### D-26 · Repo rules and principles

AGENTS.md says "no TypeScript", "minimize diffs" and "ask first" for dependencies, webpack, exports and large refactors. The spec constitution is an empty template.

- **A.** Add a "v5 branch" section to AGENTS.md:
  - TypeScript is allowed.
  - Dependencies are approved once, through the plan.
  - "Minimize diffs" applies inside each PR.

  Fill the constitution with v5 principles:
  - the core does not depend on Video.js;
  - no shared mutable state;
  - every feature cleans up after itself;
  - one way to do each thing;
  - accessibility;
  - the size budget.

  I draft both for your review.
- **B.** Keep the rules, and ask for each change.

**Recommended:** A.

**Answer (2026-11-10):** A — draft a "v5 branch" section for AGENTS.md (TypeScript allowed; dependencies approved once through the plan; minimize diffs inside each PR) and fill the constitution with the v5 principles. Both are drafts for the developer's review; nothing is saved to AGENTS.md or the constitution before approval.

### D-27 · Browsers below the floor

- **A.** Detect them, and show a native `<video>` with an MP4 source, native controls and the poster. No errors.
- **B.** Show a message.
- **C.** Do nothing.

**Recommended:** A. The video still plays.

**Answer (2026-11-10):** C — whatever is simpler; no investment. No detection and no fallback code. The docs state the browser floor; sites that need older browsers stay on v4.

---

### D-30 · Access to the inner player (`player.videojs`)

v4 exposes the raw Video.js 8 instance as `player.videojs`. Customer code uses it (`player.videojs.on(...)`, control bar children, tech access). v5 has no such object, so this is the first break most v4 integrators will hit.

- **A.** Expose the Video.js 10 player element and its state store under a documented name, with full access.
- **B.** Expose a documented, limited access point: the player element and media element, plus our events and state getters. List every common v4 `player.videojs` use in the migration guide with its v5 replacement.
- **C.** Expose nothing. The migration guide states that it is removed.

**Recommended:** B. Customers keep a way out, but we do not promise Video.js internals as our API.

**Answer (2026-11-10):** A, minimal — expose the raw Video.js 10 player (element, with its store) as player.videojs: an escape hatch for advanced users, no stability promise, no compatibility layer for v4 calls and no per-use mapping work. The migration guide states that it is now the v10 object.

---

## Planning

### D-28 · Timeline and team

Target GA date: no date yet · People on v5: the Video team · Hard deadlines (events, customers): none known

**Answer (2026-11-10):** No GA date yet — the plan gives an estimate first, and the date follows. Team: the Video team. Hard deadlines: none known.

### D-29 · Jira epic

Draft for the VIDEO project (created only after you approve):

> **Epic:** Cloudinary Video Player v5 — rewrite on Video.js 10
>
> **Goal:** Rebuild the player on Video.js 10 (v8 moves to security-only maintenance) and remove v4's accumulated complexity, with a small, clear and fully typed codebase.
>
> **Decisions:**
> - A standalone Cloudinary core (with one module for the Cloudinary video service) plus a thin Video.js 10 layer on public APIs.
> - A breaking major, but configs stay close to v4: the v4 start functions and the minimal snippet keep working, and saved profiles and per-asset configs are read as stored.
> - JS factory and `<cld-video-player>` custom element. TypeScript. ESM-only npm package; the main CDN file names stay.
> - Full parity at 5.0 for kept features, including ads (IMA) and playlists. One generic overlay plugin replaces the upcoming-video and recommendations overlays.
> - The default look stays v4 (dark and light), with SVG icons and self-hosted Inter.
> - Browsers: Safari/iOS 16.4+, Chrome/Edge 111+, Firefox 121+, plus iOS and Android WebViews.
> - v4 gets security and critical fixes for 6 months after 5.0 GA.
>
> **Removed or out of scope:** Interaction areas, Shoppable, `Cloudinary.new()`, CommonJS/UMD builds, Smart TVs, DRM, framework wrappers. 360 is tracked for 5.x.
>
> **Done when:** the spec's success criteria pass (URL parity, demo parity, size budgets, accessibility, migration guide).

**Answer (2026-11-11):** Text approved as drafted above. Create the epic in VIDEO together with its child tasks, once the plan and task list exist (ADF description).
