# Feature Specification: Cloudinary Video Player v5 (rewrite on Video.js 10)

**Feature Branch**: `001-v5-videojs10-rewrite`

**Created**: 2026-10-18

**Updated**: 2026-11-11 — all open questions answered (`dilemmas.md` D-01 to D-30); no clarification markers remain.

**Status**: Draft

**Input**: User description: "Rewrite the Cloudinary Video Player on Video.js 10. Refactor all our own additions, plugins and logic to fix historical mistakes and over-complexity. Simple, elegant, focused and clear."

**Companion files**: `audit.md` (v4 codebase audit), `log.md` (decision log), `dilemmas.md` (questions D-01 to D-30 with the developer's answers).

## Context

v4 is built on Video.js 8, which moves to security-only maintenance. Video.js 10 is a rebuild, not an upgrade: it has no plugin or component registry, no ads, no playlists and no context menu, and its extension APIs are internal. v4 also carries years of accidental complexity (see `audit.md`): five ways to start a player with four return types, state shared between plugins through the player object, options mutated across sources, an options contract typed as `any`, and a JSON schema that no longer matches the defaults.

v5 is a major release that keeps what integrators and viewers rely on, removes what is broken or unused, and leaves a codebase that is small and easy to reason about.

### Decided constraints (from `log.md` and `dilemmas.md`)

- **Foundation**: built on Video.js 10. Cloudinary logic (media URLs, poster, tracks, configuration) lives in a standalone core that does not depend on Video.js; a thin layer connects it to Video.js 10 through public APIs only. Every request to the Cloudinary video service goes through one core module (D-08).
- **Compatibility**: breaking major release, but configuration and customer pages stay as close to v4 as possible: "improve what is possible, avoid breaking customer pages". Each change is deliberate and listed in the migration guide. The minimal v4 usage must keep working without edits.
- **Entry points**: the v4 factory functions keep their v4 call forms and return shapes (D-07), plus a new custom HTML element. All accept the same options.
- **Scope**: full parity at 5.0 for every feature in the 5.0 feature list (D-01), including ads. Guiding principle: the smallest possible bundle. Framework wrappers (React, Vue, Svelte) are not in 5.0; the docs show how to use the custom element in them (D-05).
- **Platforms**: Safari/iOS 16.4+, Chrome/Edge 111+, Firefox 121+, iOS WKWebView and Android System WebView at the same engine versions. Smart TVs, set-top boxes and older browsers are out of scope and stay on v4 (D-27).
- **Distribution**: same npm package name, ESM only on npm; the main CDN file names and the `window.cloudinary` global stay (D-06, D-23, D-24).
- **v4 support**: security and critical fixes for 6 months after 5.0 GA (D-04).
- **Source language**: TypeScript. An AGENTS.md "v5 branch" section and a constitution are drafted for review (D-26); until they are approved, the current repository rules apply.

## User Scenarios & Testing *(mandatory)*

Actors: **Integrator** (developer who embeds the player through the CDN or npm), **Viewer** (person who watches), **v4 customer** (integrator who upgrades), **Cloudinary product** (Console media preview, Video Player Studio, the embedded player page, SDKs and widgets, tx-builder, canvas, image-to-video and others) that hosts the player through npm.

### User Story 1 - Minimal embed just works (Priority: P1)

An integrator adds the player to a page with a cloud name and a public ID, using either the v4-style factory or the custom element, from the CDN or npm. The viewer gets an optimized, adaptive video with a poster and standard controls.

**Why this priority**: This is the entry point for every customer and the explicit "just works" promise.

**Independent Test**: Load a page with only the minimal snippet (v4 README form and custom-element form) in each supported browser; the poster shows and the video plays.

**Acceptance Scenarios**:

1. **Given** a page with the v4 README snippet (`cloudinary.videoPlayer('player', { cloudName: 'demo', publicId: 'cld-sample-video' })` on a `<video>` element) and the v5 CDN files, **When** the page loads, **Then** the player shows a Cloudinary poster and plays the video when the viewer presses play.
2. **Given** `<cld-video-player cloud-name="demo" public-id="cld-sample-video">`, **When** the page loads, **Then** the result is the same as scenario 1.
3. **Given** the minimal setup, **When** the viewer plays the video, **Then** the player picks a format and quality suited to the browser, screen size and network, without any extra option.
4. **Given** the integrator calls methods (for example `source()`, `play()`) on the object that `videoPlayer()` returns, right after creating it, **When** setup is still in progress, **Then** the calls take effect once the player is ready and are never silently dropped.

---

### User Story 2 - Cloudinary media delivery (Priority: P1)

An integrator controls what the viewer receives using Cloudinary concepts: transformations, source types and codecs, breakpoints, aspect ratio and crop, HDR, raw URLs, poster options, audio-only sources, live streams and private (credentialed) media.

**Why this priority**: Media delivery is the reason customers choose this player over a generic one.

**Independent Test**: For a fixed set of source configurations, compare the URLs that v5 requests with the URLs that v4 requests; they match except for documented, intentional changes.

**Acceptance Scenarios**:

1. **Given** a source with transformations and source types, **When** the player loads it, **Then** the requested media URLs are identical to v4 for the same input (unless listed as an intentional change).
2. **Given** a second `source()` call with different options, **When** it loads, **Then** nothing from the first source (transformations, cloud config, query parameters) leaks into the second.
3. **Given** a source type the browser cannot play, **When** the player loads the source, **Then** it falls back to the next playable type.
4. **Given** a private asset that needs credentials, **When** the player loads media, captions, thumbnails and poster, **Then** every request carries credentials.
5. **Given** a live stream that has not started, **When** the player loads it, **Then** the viewer sees a "not started" state and playback starts on its own once the stream is available.
6. **Given** an asset with a poster saved on Cloudinary and no `poster` option, **When** the player loads, **Then** the saved poster shows at once and does not change when the per-asset configuration arrives.
7. **Given** an AES-encrypted HLS stream or a live stream with TS segments, **When** the player loads it, **Then** it plays as in v4.

---

### User Story 3 - Upgrade from v4 (Priority: P2)

A v4 customer upgrades with minimal edits. Existing configurations, including configurations saved on Cloudinary servers, keep working; anything that changed is listed in a migration guide and reported in debug mode.

**Why this priority**: v5 is breaking, but the cost of moving must stay low or customers will stay on v4.

**Independent Test**: Run a sample of real v4 configurations (demo pages and saved profiles) through v5; each either works unchanged or produces a documented debug warning that names the replacement.

**Acceptance Scenarios**:

1. **Given** a v4 configuration that uses only unchanged options, **When** it runs on v5, **Then** the player behaves as it did on v4.
2. **Given** a v4 configuration with a renamed or removed option, **When** it runs on v5 in debug mode, **Then** the console names the option and its replacement (or says it was removed).
3. **Given** a profile or per-asset configuration saved on Cloudinary servers with v4 option names, **When** `player()` starts with it, **Then** v5 applies it as stored, and renamed options are converted through the same mapping table that the migration guide lists.
4. **Given** v4 code that waits for `cloudinary.player(...)` (with `await` or `.then`), **When** it runs on v5, **Then** the Promise resolves to the player after the saved configuration is applied.
5. **Given** v4 code that reaches into `player.videojs`, **When** it runs on v5, **Then** `player.videojs` is the Video.js 10 player (an escape hatch with no stability promise), and the migration guide says so.
6. **Given** v4 code that uses `Cloudinary.new()` or loads the package with CommonJS `require()`, **When** the customer upgrades, **Then** the migration guide states that both are removed and names the replacement.

---

### User Story 4 - Captions and accessibility (Priority: P2)

A viewer turns on captions or subtitles (VTT, SRT, or Cloudinary auto-generated transcripts), optionally with styled text and word highlighting, and can operate the whole player with a keyboard or a screen reader.

**Why this priority**: Captions are the top source of v4 bug reports, and accessibility is a hard requirement.

**Independent Test**: Load each caption type and style on each platform; run an automated accessibility check and a keyboard-only session.

**Acceptance Scenarios**:

1. **Given** a source with VTT, SRT and transcript tracks, **When** the viewer opens the captions menu, **Then** every track is listed and each one shows correctly when selected, including on iOS fullscreen.
2. **Given** a transcript that is still being generated, **When** the viewer selects it, **Then** the player waits and shows it once it is ready.
3. **Given** caption style options, **When** captions show, **Then** the style applies without breaking readability on small or portrait players.
4. **Given** a keyboard-only viewer, **When** they use the player, **Then** every control is reachable, has a visible focus indicator and an accessible name.

---

### User Story 5 - Ads (Priority: P2)

An integrator configures IMA/VAST ads (pre-roll, mid-roll, post-roll, and ads in playlists) with the same options as v4. The viewer sees the IMA SDK's ad UI, and content resumes after each ad. Ad features beyond v4 are out of scope.

**Why this priority**: Ads are a monetization feature that customers depend on, and Video.js 10 provides nothing for them.

**Independent Test**: Run the v4 VAST/VPAID demo configurations on v5 and verify ad start, skip, completion and content resume, plus the blocked-ad case.

**Acceptance Scenarios**:

1. **Given** an `ads` configuration with an ad tag, **When** the viewer presses play, **Then** the pre-roll plays, then the content.
2. **Given** an ad blocker or an ad tag error, **When** the viewer presses play, **Then** the content plays without the ad and without a player error.
3. **Given** a playlist with `ads.adsInPlaylist` set to `first-video` or `every-video`, **When** the next video starts, **Then** ads play as in v4 for that setting.

---

### User Story 6 - Playlists and "next up" (Priority: P2)

An integrator plays a list of videos (explicit or by tag), with auto-advance, next and previous controls, an optional playlist widget, an upcoming-video overlay and an end screen that recommends what to watch next. Both overlays are built on the generic overlay feature (User Story 7).

**Why this priority**: Widely used in demos and by customers; Video.js 10 has no playlist support.

**Independent Test**: Run the v4 playlist, playlist-by-tag and recommendations demos on v5.

**Acceptance Scenarios**:

1. **Given** a playlist, **When** a video ends, **Then** the next one starts (when auto-advance is on) and the upcoming-video overlay showed before the end.
2. **Given** next and previous are called before the playlist finished loading, **When** loading completes, **Then** the calls take effect; they never hang or fail.

---

### User Story 7 - Engagement features and overlays (Priority: P3)

The integrator enables the v4 engagement features kept in D-01: chapters, seek thumbnails, AI highlights graph, download, source switcher, title and description, logo, colors and skins, context menu, floating mode and autoplay on scroll. The integrator can also show their own content over the video through the generic overlay feature.

**Why this priority**: Required for parity, but each is independent and can be built after the core.

**Independent Test**: Each kept feature has a demo page and an automated check equivalent to its v4 demo; the overlay feature has its own demo page.

**Acceptance Scenarios**:

1. **Given** any kept feature enabled through its v4 option, **When** the source changes, **Then** the feature updates for the new source and does not keep state from the previous one.
2. **Given** a player with all kept features enabled, **When** it is removed from the page, **Then** no listeners, timers or added page elements remain.
3. **Given** an overlay added through the generic overlay feature, **When** its trigger is reached (for example a point in time or the end of the video), **Then** it shows over the video, can be operated with a keyboard, and is removed when dismissed or when the source changes.

---

### User Story 8 - Loading control (Priority: P3)

The integrator controls when and how the player loads: lazy loading (poster and play button first, player on click or on scroll), schedules (show the player only in a time window), saved profiles, and many players on one page.

**Why this priority**: Matters for page performance and for hosted Cloudinary products, but not for basic playback.

**Independent Test**: Run the v4 lazy, schedule, profiles and multiple-players demos on v5 and measure what loads before interaction.

**Acceptance Scenarios**:

1. **Given** lazy loading, **When** the page loads, **Then** only the poster and a play button load until the viewer interacts or scrolls the player into view.
2. **Given** a schedule window that opens while the page is open, **When** the window starts, **Then** the player becomes available without a reload.
3. **Given** several players with different configurations, **When** they run on one page, **Then** no configuration or state crosses between them.
4. **Given** `player()` (or the custom element) without `videoConfig: false`, **When** the player starts, **Then** it requests the saved profile or per-asset configuration and applies it; **Given** `videoPlayer()`, **Then** it makes no such request, as in v4.

---

### User Story 9 - Analytics and events (Priority: P3)

The integrator listens to the documented player events (including percent-played and time-played milestones). The player reports Cloudinary analytics as in v4, and Google Analytics reporting stays available as an opt-in.

**Why this priority**: Required for parity and for customers' own reporting.

**Independent Test**: Subscribe to the documented events in a demo page and verify each fires once at the expected moment; inspect the usage report payload.

**Acceptance Scenarios**:

1. **Given** milestone options, **When** the viewer passes each milestone, **Then** the matching event fires exactly once per playback.
2. **Given** a listener attached immediately after creation, **When** the player loads, **Then** the listener receives the load and ready events.
3. **Given** the internal usage report, **When** a source loads, **Then** the report contains only the player version, the cloud name and the features in use, and no titles, descriptions or URLs.

### Edge Cases

- Target element not found, or not a `<video>` / custom element: a clear error that names the element; no partial player.
- Asset missing, still processing, or private without credentials: the viewer sees a Cloudinary-specific message (mapped from the Cloudinary error response), not a generic media error.
- Rapid consecutive `source()` calls: only the last source wins; no duplicate loads, no mixed state.
- Player removed from the page mid-playback or mid-load: all work stops; nothing throws later.
- Saved configuration or profile request fails: the player starts with the local options and reports the failure in debug mode.
- Caption, thumbnail or chapter file fails to load: the video still plays; only that feature is missing.
- Autoplay blocked by the browser: the player shows the play button; muted autoplay is used only if configured.
- WebView differences (autoplay, fullscreen, inline playback): documented behavior per platform, verified by the WebView checks.
- Options include `api_secret`, `sign_url` or `auth_token`: the console always shows a warning that points to server-side signing; the values are not used.
- Browser below the supported floor: no detection and no fallback; the documentation states the floor, and such sites stay on v4 (D-27).
- Very small or portrait players: controls and captions remain usable.

## Requirements *(mandatory)*

### Functional Requirements

**Entry points and API**

- **FR-001**: The player MUST be creatable from the v4 factory functions (`videoPlayer`, `videoPlayers`, `player`, `players`) with a target (element, element ID, or selector for the plural forms) and options, and from a custom HTML element whose attributes map to the same options.
- **FR-002**: The v4 minimal usage (factory call on a `<video>` element with `cloudName` and `publicId`, loaded from the CDN with a classic script tag) MUST work without edits.
- **FR-003**: `videoPlayer()` and `videoPlayers()` MUST return player objects at once, without a placeholder object; methods called before setup finishes MUST be applied once the player is ready, and getters MUST return current values. `player()` and `players()` MUST return a Promise that resolves to the same kind of player object after the saved configuration is applied. The v4 `ready` callback MUST keep working.
- **FR-004**: Each public method MUST have one purpose, one documented, typed signature and one return type. The v4 combined getter/setter methods (for example `volume()`, `currentTime()`, `width()`, `height()`, `loop()`, `controls()`, `fluid()`) MAY be split into separate read and write methods, or removed, where they add complexity (little use is expected); every such change MUST be listed in the migration guide. `source()` and the methods used by the minimal v4 usage MUST keep their v4 forms.
- **FR-005**: The player MUST be fully removable: after removal, no listeners, timers, page elements or network polling remain.
- **FR-034**: `Cloudinary.new()` MUST be removed and listed in the migration guide.
- **FR-035**: The player MUST expose the underlying Video.js 10 player as `player.videojs`, documented as an escape hatch with no stability promise and no compatibility with v4 calls.

**Configuration and compatibility**

- **FR-006**: Options MUST keep their v4 names and shapes unless the change is listed in the migration guide with a reason. Cloud settings MUST be accepted as `cloud_name` or `cloudName`, at the top level or in `cloudinaryConfig`, and normalized once at entry.
- **FR-007**: Every option MUST have one definition (type, default, example) that drives validation, editor types and documentation together. The JSON schema (`schema.json`) MUST still be published, generated from that definition.
- **FR-008**: In debug mode, the player MUST report unknown, deprecated, renamed and invalid options with the suggested replacement.
- **FR-009**: Options passed to one source MUST NOT change the player-wide options or any later source.
- **FR-010**: `player()`, `players()` and the custom element MUST apply saved Cloudinary profiles and per-asset configurations as they are stored today (v4 option names); renamed options MUST be converted through one mapping table, which the migration guide also lists. `videoPlayer()` and `videoPlayers()` MUST NOT request them, as in v4.
- **FR-036**: On a `<video>` element, options MUST come only from `data-cld-*` attributes and the native media attributes (`autoplay`, `muted`, `loop`, `controls`, `playsinline`, `preload`, `poster`). Other attributes (for example `class`, `id`, `style`) MUST NOT become options.
- **FR-037**: Profiles loaded from a raw URL MUST keep the v4 behavior: any URL is accepted, and its JSON is merged into the options.

**Media delivery**

- **FR-011**: For the same input, media, poster, caption, thumbnail and chapter URLs MUST match v4, except for documented intentional changes (for example, the default poster URL from FR-038).
- **FR-012**: The player MUST support Cloudinary transformations (including variables and conditions), source types (including codec variants and automatic format), breakpoints, aspect ratio and crop, HDR, raw URLs, audio-only sources, live streams and query parameters, as in v4.
- **FR-013**: The player MUST fall back across source types when the browser cannot play one.
- **FR-014**: The player MUST support adaptive streaming (HLS and DASH), including AES-encrypted HLS and live streams with TS segments, with quality selection and audio-track selection where the stream provides them. The v4 adaptive-streaming strategy presets and the HDR preference MUST keep working. DRM is out of scope.
- **FR-015**: When credentials are requested, every request the player makes for that source MUST include them.
- **FR-016**: The player MUST show Cloudinary-specific error messages for known Cloudinary error responses (missing, processing, unauthorized, rate-limited) and keep retrying a live stream until it starts.
- **FR-038**: When no explicit `poster` is set and the source is a Cloudinary video asset (a public ID, not a raw URL or an audio-only source), the player MUST load the poster saved on the asset from the Cloudinary video service (which falls back to the default video still), for every way of creating a player. The poster MUST show at once and MUST NOT change when the per-asset configuration arrives, unless that configuration sets a different poster.

**Captions and accessibility**

- **FR-017**: The player MUST load VTT, SRT and Cloudinary transcript tracks, wait for transcripts that are still being generated, and support caption styling and word highlighting as in v4.
- **FR-018**: Loading or removing captions MUST NOT remove other tracks (chapters, thumbnails).
- **FR-019**: The player MUST meet WCAG 2.2 AA: keyboard operable, visible focus, accessible names on every control, sufficient contrast in every skin.

**Ads**

- **FR-020**: The player MUST play IMA/VAST ads (pre-, mid- and post-roll, and ads in playlists) configured with the v4 `ads` options, with the IMA SDK's ad UI, and MUST play the content if ads fail or are blocked. VPAID works only as far as the IMA SDK supports it. Ad features beyond v4 are out of scope.

**Playlists, recommendations and overlays**

- **FR-021**: The player MUST support playlists (explicit and by tag), auto-advance, next/previous, a playlist widget, an upcoming-video overlay and a recommendations end screen, as in v4. The upcoming-video overlay and the recommendations end screen MUST be built on the generic overlay feature (FR-039).
- **FR-039**: The player MUST provide a documented, generic overlay feature that shows content over the video, which integrators can also use for their own overlays. Overlays MUST meet the same accessibility and clean-up rules as every other feature.

**Features kept from v4**

- **FR-022**: Every feature in the 5.0 feature list MUST be available through its v4 option, MUST react to source changes, and MUST clean up after itself.
- **FR-023**: Features that customize the seek bar (thumbnails, chapters, AI highlights graph) MUST work together without overriding each other.

**Look and feel**

- **FR-040**: The default look MUST match the v4 dark and light skins (small improvements are allowed), and the v4 `colors` option MUST apply to it. The other Video.js 10 skins MAY be offered through the `skin` option, each loaded only when used, if the plan finds the cost low; otherwise they move to 5.x.
- **FR-041**: The default font MUST be Inter, served from Cloudinary; `fontFace` MUST still load a named font when it is set.

**Loading**

- **FR-024**: The player MUST support lazy loading (poster and play button first; load on interaction or on scroll into view).
- **FR-025**: The player MUST support schedules and MUST become available when a schedule window opens, without a page reload.
- **FR-026**: Many players on one page MUST be fully independent.

**Analytics, privacy and security**

- **FR-027**: The player MUST emit the documented v4 public events with their v4 payloads (including percent-played and time-played milestones), published as one typed event list; internal events MUST NOT be part of that list. Load and ready events MUST reach listeners attached right after creation.
- **FR-028**: Cloudinary analytics MUST run as in v4 (on by default). The internal usage report MUST send only the player version, the cloud name and the features in use, with no titles, descriptions or URLs; the product manager approves this data list. Google Analytics reporting MUST stay available as an opt-in. With default options (no ads, no Google Analytics, no custom font), the player MUST NOT request anything from hosts other than Cloudinary's and the host that serves the player (for example, no Google Fonts).
- **FR-029**: The player MUST NOT use `api_secret`, `sign_url` or `auth_token`. When any of them is passed, the player MUST show a console warning in every mode that points to server-side signing.
- **FR-030**: The player MUST NOT render user-supplied text or markup as HTML.

**Distribution**

- **FR-031**: On the CDN, `player.min.js`, `player.min.css`, `cld-video-player.min.js`, `cld-video-player.min.css` and the `window.cloudinary` global MUST stay, loadable with a classic script tag as in v4; the `.light` and non-minified copies are removed. On npm, the package MUST be ESM only, with the exports `.` (factory and element) and the CSS file. Optional features MUST load only when used.
- **FR-032**: The lazy shell (poster and play button) MUST stay at or below the v4 entry size (10 KB compressed). The default player and each optional feature MUST stay within the budgets set in the plan, measured on every build.

**Scope**

- **FR-033**: 5.0 MUST include every feature marked Keep, Replace or New in the 5.0 feature list below, and MUST NOT include the features marked Remove or "Not in 5.0".

### 5.0 feature list (D-01)

Core media delivery (transformations, source types, breakpoints, crop, HDR, raw URLs, audio, live, errors) is always in and not listed.

| Feature | v4 option | 5.0 |
|---|---|---|
| Adaptive streaming, quality menu, audio tracks | `sourceTypes` hls/dash, `adaptiveStreaming` | Keep |
| ABR strategy presets and HDR preference | `adaptiveStreaming.strategy` | Keep |
| Seek thumbnails | `seekThumbnails` | Keep |
| Chapters | `chapters`, `chaptersButton` | Keep |
| AI highlights graph | `aiHighlightsGraph` | Keep |
| Captions: SRT, transcripts, word highlight, styles | `textTracks` | Keep |
| Title and description | `title`, `description`, `info` | Keep |
| ±10 s jump buttons | `showJumpControls` | Keep |
| Picture-in-picture button | `pictureInPictureToggle` | Keep |
| Logo button | `showLogo`, `logoImageUrl`, `logoOnclickUrl` | Keep |
| Colors | `colors` | Keep |
| Dark and light skins | `skin` | Keep |
| Custom font | `fontFace` | Keep |
| Big play button only at start | `bigPlayButton: 'init'` | Keep |
| Mobile big pause button | automatic | Replace with the Video.js 10 mobile controls |
| Playlist, by tag, auto-advance, next/previous | `playlist()`, `playlistByTag()` | Keep |
| Playlist widget (vertical, horizontal, custom) | `playlistWidget` | Keep |
| Upcoming-video overlay | playlist options | Replace: built on the generic overlay feature |
| Recommendations end screen | `recommendations`, `autoShowRecommendations` | Replace: built on the generic overlay feature |
| Generic overlay feature | none | New |
| Ads (IMA) | `ads` | Keep |
| Download button | `download` | Keep |
| Source switcher | `videoSources` | Keep |
| Floating player | `floatingWhenNotVisible` | Keep |
| Autoplay on scroll | `autoplayMode: 'on-scroll'` | Keep |
| Context menu | `hideContextMenu` | Keep |
| Google Analytics plugin | `analytics` | Keep (opt-in) |
| Cloudinary analytics | `cloudinaryAnalytics` | Keep |
| Lazy loading | `lazy` | Keep |
| Schedule | `schedule` | Keep, fix activation |
| Profiles and per-asset configuration | `profile`, `videoConfig` | Keep |
| Played-percent and played-time events | `playedEventPercents`, `playedEventTimes` | Keep |
| Cloudinary error messages | automatic | Keep |
| Debug mode and validation | `debug` | Keep |
| Interaction areas | `interactionAreas`, `interactionDisplay` | Remove |
| Shoppable | `shoppable` | Remove |
| `Cloudinary.new()` | none | Remove |
| 360 video | none (demo only) | Not in 5.0; tracked for 5.x |

### Key Entities

- **Player**: one instance on the page; holds options, current source and state; exposes the API, the events, and `player.videojs` (the Video.js 10 player, as an escape hatch).
- **Player options**: the configuration contract (player-level and source-level); one definition per option, also published as a JSON schema.
- **Cloud configuration**: cloud name and delivery settings (domain, secure, private CDN); never secrets.
- **Source**: a public ID or URL plus source options; produces media renditions, poster, tracks and metadata. Immutable once created.
- **Transformation**: Cloudinary delivery instructions applied to media, poster and thumbnails.
- **Rendition**: one playable variant (format, codec, streaming manifest) with its media type.
- **Poster**: image shown before playback: the poster saved on the asset, a Cloudinary image or frame, or an audio waveform.
- **Text track**: captions, subtitles, transcripts, chapters or thumbnails attached to a source.
- **Playlist**: ordered sources with auto-advance and "next up" metadata.
- **Overlay**: content shown over the video by the generic overlay feature (upcoming video, recommendations, or integrator content).
- **Ad configuration**: ad tag and ad behavior options.
- **Video service**: Cloudinary's per-video server resources, addressed by delivery type and public ID: saved profiles, per-asset configuration, saved poster, chapters, transcripts and metadata.
- **Profile**: a named, raw-URL or per-asset configuration stored with v4 option names and merged with local options.
- **Player event**: a named, documented notification with a defined payload.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The v4 README snippet and the custom-element snippet play video in 100% of supported browsers and WebViews with no code change.
- **SC-002**: For the full v4 URL-generation test set (currently 64 cases), v5 produces identical URLs in 100% of cases, except cases listed as intentional changes.
- **SC-003**: Every v4 demo page for a kept feature has a v5 equivalent that passes an automated playback check in all supported desktop browsers.
- **SC-004**: At least 90% of a sample of real v4 configurations (demo pages plus saved profiles) run on v5 without edits; 100% of the rest produce a debug message that names the fix.
- **SC-005**: A v4 integrator can migrate a typical configuration in under 30 minutes using the migration guide.
- **SC-006**: Time to first frame on the minimal embed is equal to or better than v4 on the same page, browser and network.
- **SC-007**: The lazy shell is at most 10 KB compressed (the v4 limit). The default player download (code and styles, without streaming engine and ads) stays within the budget set in the plan, which starts at 60 KB compressed and is never more than half of the v4 full player (about 140 KB); each optional feature starts from a 15 KB budget.
- **SC-008**: The player's own source code is at most half the size of v4's (v4: about 11,600 lines, excluding tests and styles).
- **SC-009**: Zero automated accessibility violations at WCAG 2.2 AA in every skin; every control works with keyboard only.
- **SC-010**: After 100 create/remove cycles on one page, no player listeners, timers or page elements remain.
- **SC-011**: Every defect listed in `audit.md` is either covered by a v5 test that proves it is gone or is marked not applicable.
- **SC-012**: For assets with a saved poster, the first poster the viewer sees is the saved poster in 100% of test cases, with no poster change after the per-asset configuration arrives.
- **SC-013**: With default options (no ads, no Google Analytics, no custom font), the player makes zero requests to hosts other than Cloudinary's and the host that serves the player.

## Assumptions

- v4 stays available for customers who need older browsers, Smart TVs or removed features; it gets security and critical fixes for 6 months after 5.0 GA (D-04).
- The minimal v4 snippet and the v4 option names are the compatibility baseline; the README snippet is the canonical "simple usage".
- Video.js 10 provides captions, chapters as seek-bar segments, storyboard thumbnails, picture-in-picture, fullscreen, keyboard shortcuts, live/DVR, and adaptive streaming adapters; v5 uses these instead of re-implementing them.
- Features Video.js 10 does not provide (ads, playlists, overlays, download, source switcher, logo, context menu, AI highlights graph, Cloudinary media logic) are built by us on public APIs.
- Cloudinary VOD HLS and DASH output is fragmented MP4 (verified on the demo account). Customers also use AES-encrypted HLS and live streams with TS segments, which must keep playing (D-18).
- Usage data per feature is not available; the D-01 decisions rely on the audit, demo coverage and team knowledge.
- WebView support is verified on the team's own devices for each release candidate (no device cloud); WebView-specific limits (autoplay, fullscreen) are documented, not worked around at any cost.
- Cloudinary products that host the player use it through npm with pinned versions, so none receives v5 by accident; each moves after GA in a planned step. The owner per product is an open item for the plan (D-03).
- There is no designer or Figma file for v5; engineering restyles the default skin to the v4 look (D-19).
- [Assumption] The custom element applies saved configurations like `player()` (`videoConfig` on by default), because it is new in v5 and has no v4 behavior to keep.
- The work is done by the Video team. There is no GA date yet; the plan gives an estimate first (D-28).
