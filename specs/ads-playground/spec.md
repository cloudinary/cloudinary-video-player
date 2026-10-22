# Feature Specification: Interactive Ads Playground

**Feature Branch**: `feat/ads-playground`

**Created**: 2026-09-01

**Status**: Approved

**Ticket**: [VIDEO-21179](https://cloudinary.atlassian.net/browse/VIDEO-21179)

**Input**: Raz's request (Slack, C0BSA33PVKR): a simple interactive playground so customer-facing teams can demo client-side ad insertion with different sources and configurations. Driven by the Financial Times opportunity; the general problem is that customer-facing teams struggle to configure and demo ads.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run a canned ad demo (Priority: P1)

A sales engineer opens the page, clicks a preset ad scenario (e.g. "Pre-roll") and a
sample video, and plays. The ad plays before/during/after the content exactly as the
preset describes. No code, no configuration knowledge.

**Why this priority**: This is the core ask — "easily show and demo this capability."

**Independent Test**: Open page → pick "Pre-roll" preset → play → pre-roll ad renders,
then content plays.

**Acceptance Scenarios**:

1. **Given** the page loaded fresh, **When** the user presses play, **Then** the default
   preset's ad plays against the default sample video.
2. **Given** any preset selected, **When** the user clicks Apply/play, **Then** the
   matching ad behavior occurs (pre-roll / mid-roll / post-roll / VMAP pods / skippable).
3. **Given** the "error tag" preset, **When** played, **Then** the player falls back to
   content gracefully and the event log shows the ad error.

### User Story 2 - Customize the demo (Priority: P2)

The SE swaps in a customer's own ad tag URL and/or video (public ID or raw URL, or a
playlist tag), tweaks the supported `ads` options (adLabel, locale, countdown, timeouts,
adsInPlaylist, debug), and re-runs.

**Acceptance Scenarios**:

1. **Given** a pasted custom ad tag, **When** Apply is clicked, **Then** the player
   re-initializes and requests that tag (visible in the event log).
2. **Given** playlist mode with `adsInPlaylist: every-video`, **When** the playlist
   advances, **Then** an ad break plays on each video; with `first-video`, only on the first.
3. **Given** any option change, **When** Apply is clicked, **Then** the rendered config
   snippet reflects it exactly.

### User Story 3 - Share and hand off (Priority: P3)

The SE copies the generated `cloudinary.videoPlayer(...)` snippet for the customer, and/or
copies the page URL — which encodes the current settings — to send to a teammate.

**Acceptance Scenarios**:

1. **Given** a configured demo, **When** the URL is opened in a fresh tab, **Then** the
   same settings are restored.
2. **Given** a configured demo, **When** "Copy config" is clicked, **Then** the clipboard
   holds a valid, runnable player-init snippet matching the live player.

### Edge Cases

- Ad blocker / IMA SDK failed to load → clear inline notice, content still plays.
- Empty/garbage ad tag URL → player plays content; error surfaced in event log.
- Invalid public ID → player error surfaced without breaking the page.
- Mobile viewport → layout stacks; controls usable by touch.

## Requirements *(mandatory)*

### Functional

- **FR-1**: Standalone page `docs/ads-playground.html` — NOT linked from the examples
  index (sales tool, not a developer example). Served by the existing docs tooling.
- **FR-2**: Ad tag presets from Google's public IMA sample tags: pre-roll, skippable,
  post-roll, VMAP pre+mid+post ("ad rules"), VMAP pods, VPAID 2 JS, and an error tag —
  plus a free-text field for any custom tag.
- **FR-3**: Source selection: sample-video thumbnail strip, custom public ID / raw URL
  input, and playlist-by-tag mode (default tag `video_race`, cloud `demo`); editable
  cloud name.
- **FR-4**: Controls for every supported `ads` option: `adTagUrl`, `showCountdown`,
  `adLabel`, `locale`, `prerollTimeout`, `postrollTimeout`, `adsInPlaylist`, `debug`.
- **FR-5**: Apply re-creates the player (dispose + fresh `<video>` + re-init) with the
  current settings.
- **FR-6**: Live event log of ad lifecycle + errors, timestamped, clearable.
- **FR-7**: Copyable init snippet, always in sync with the live player.
- **FR-8**: Settings round-trip through the URL query string.
- **FR-9**: Fix `src/plugins/ima/index.js` — `denug` typo → `debug`; add `debug` and
  `autoPlayAdBreaks` to `configSchema.json` and validators. Unit-test the plugin's
  option mapping.

### Design

- **DR-1**: Dark theme per cloudinary.com/agents tokens: bg `#070F1A`, panels `#0B1623`,
  hairline `rgba(255,255,255,.09)`, text `#fff`/`rgba(255,255,255,.58)`, accent
  `#0095FF`, Inter, radii 16/8/6px, pill buttons. Single accent, ≤2 font weights + one
  display weight.
- **DR-2**: Layout per videoapi.cloudinary.com demo pages: breadcrumb + hero title,
  thumbnail source strip (active = accent ring), preview left / control rack right,
  stacking to one column on mobile.
- **DR-3**: Self-contained CSS on the page (no Bootstrap). Inter via Google Fonts with
  system-ui fallback. No new package dependencies.
- **DR-4**: Accessible: semantic controls, keyboard navigable, visible focus, WCAG AA
  contrast on the dark palette, labels on every control.
- **DR-5**: Every state designed: loading, ad playing (accent "Ad" badge state),
  error notice, empty log.

### Out of scope

Native SDKs (iOS/Android/RN), SSAI/DAI, IAS/DoubleVerify, changes to the examples index,
new runtime dependencies, player feature work beyond FR-9.

## Success Criteria *(mandatory)*

- **SC-1**: A non-developer can run pre-roll, mid-roll and post-roll demos with zero code
  edits (US-1).
- **SC-2**: All presets play against the real Google sample tags in Chrome + Safari.
- **SC-3**: URL sharing restores an identical demo (US-3).
- **SC-4**: `npm run lint` and `npm run test:unit` pass; the new plugin test covers the
  `debug` mapping (would have caught the `denug` typo).
- **SC-5**: Page holds at 375px and 1440px widths.
