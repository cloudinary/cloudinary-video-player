# Contract: player and source options

**Requirements**: FR-006 to FR-010, FR-029, FR-036, FR-037. **Data model**: `data-model.md` §1–3.

## Rules

1. **One definition.** Each option is defined once in `src/core/options/types.ts` with its type, `@default`, `@description` and `@example` JSDoc. That file drives validation, editor types (`.d.ts`) and the generated `schema.json` (D-11, FR-007).
2. **One normalization.** `normalizeOptions()` runs once at entry. It accepts snake_case and camelCase cloud keys, top level or in `cloudinaryConfig`, and the v4 aliases below; the result is frozen.
3. **One rename table.** `src/core/options/renames.ts` maps v4 names to v5 names. The same table converts saved profiles and per-asset configurations (FR-010) and is printed in the migration guide.
4. **Debug report.** In `debug` mode, every unknown, renamed, deprecated, removed or invalid option produces one console message that names the replacement (FR-008).
5. **Source isolation.** Source options apply to one source only (FR-009).
6. **Secrets.** `api_secret`, `sign_url`, `auth_token` are dropped with a warning in every mode (FR-029).

**Disposition values**: **Keep** (same name and meaning) · **Map** (accepted, converted, listed in the migration guide) · **Remove** (ignored, debug warning names the replacement or says "removed").

Level: **P** = player only, **S** = source (also accepted at player level as the default for every source).

## Cloud configuration (normalized to `CloudConfig`)

| Option | Level | Disposition | Notes |
|---|---|---|---|
| `cloudName` / `cloud_name` | S | Keep | |
| `cloudinaryConfig` | S | Keep | Object with any key below, snake_case or camelCase (v4 needed snake_case inside it; v5 accepts both). |
| `secure`, `private_cdn`/`privateCdn`, `secure_distribution`/`secureDistribution`, `cname`, `cdn_subdomain`, `secure_cdn_subdomain`, `use_root_path`, `url_suffix`, `shorten` | S | Keep | Same URL effects as v4 (SC-002 fixtures). |
| `api_secret`, `sign_url`, `auth_token` | — | Remove | Warning in every mode → server-side signing (FR-029). |

## Source options

| Option | Level | Disposition | Notes |
|---|---|---|---|
| `publicId` | S | Keep | Public ID or raw URL. |
| `source` | S | Keep | v4 alias for the source object in `player()` configs. |
| `type` | S | Keep | Delivery type, default `upload`. |
| `resourceType` | S | Keep | Alias `resource_type` accepted. |
| `transformation` | S | Keep | Object, array or string. Never inherited by the next source (fixes audit D). |
| `sourceTransformation` | S | Keep | Per source type. |
| `rawTransformation` | S | Keep | Applied to the URL and to the codec check (v4 used it only for the codec check). |
| `sourceTypes` | S | Keep | Default `['auto']`. |
| `breakpoints`, `maxDpr` | S | Keep | |
| `aspectRatio`, `cropMode`, `cropPadColor` | S | Keep | |
| `hdr` | S | Keep | |
| `poster`, `posterOptions` | S | Keep | Default poster changes to the saved poster (FR-038; intentional URL change). |
| `textTracks` | S | Keep | Including `options` (theme, fontFace, fontSize, gravity, box, style, wordHighlight, wordHighlightStyle, maxWords, timeOffset). |
| `chapters` | S | Keep | `true`, URL or object. |
| `title`, `description` | S | Keep | Plain text (FR-030). |
| `info` | S | Keep | `{ title, subtitle, description }`; fixes the v4 subtitle/description mix-up (audit D). |
| `download` | S | Keep | |
| `recommendations`, `autoShowRecommendations` | S | Keep | Built on the overlay feature (FR-021). |
| `videoSources` | S | Keep | Source switcher. |
| `queryParams` | S | Keep | v4 read it only per source; v5 also honors the player-level default (audit D). |
| `withCredentials` | S | Keep | Every request for the source (FR-015). |
| `adaptiveStreaming` | S | Keep | `{ strategy }` presets and HDR preference (FR-014). |
| `allowUsageReport` | S | Keep | Also controls `_s=vp` on video-service requests (`contracts/video-service.md`). |
| `interactionAreas` | S | Remove | Feature removed (D-01). |
| `shoppable` | S | Remove | Feature removed (D-01). |

## Player options

| Option | Level | Disposition | Notes |
|---|---|---|---|
| `autoplay` | P | Keep | |
| `autoplayMode` | P | Keep | `'always' \| 'on-scroll' \| 'never'`. |
| `muted` | P | Keep | As v4, the volume is preset to 0.4 so that unmuting is not at full volume. |
| `loop`, `controls`, `playsinline`, `preload` | P | Keep | `playsinline` default `true` on iOS, as v4. |
| `fluid` | P | Keep | |
| `bigPlayButton` | P | Keep | `boolean \| 'init'`. |
| `playbackRates` | P | Keep | See the review below (D-09). |
| `skin` | P | Keep | `'dark' \| 'light'`. Other v10 skins are not in 5.0; moved to 5.x (R-05, FR-040). |
| `colors` | P | Keep | `{ base, accent, text }`. |
| `fontFace` | P | Keep | Default Inter from Cloudinary (FR-041). |
| `showLogo`, `logoImageUrl`, `logoOnclickUrl` | P | Keep | URL validated (http/https only). |
| `showJumpControls` | P | Keep | |
| `pictureInPictureToggle` | P | Keep | |
| `chaptersButton` | P | Keep | |
| `seekThumbnails` | P | Keep | Default `true`. |
| `aiHighlightsGraph` | P | Keep | |
| `hideContextMenu` | P | Keep | |
| `contextMenu` | P | Remove | Internal default in v4 (`defaults.js`), never documented. |
| `floatingWhenNotVisible` | P | Keep | `'left' \| 'right' \| 'none'`. |
| `playlistWidget` | P | Keep | |
| `ads` | P | Keep | All seven v4 keys (`data-model.md` §10). |
| `analytics` | P | Keep | Google Analytics, opt-in. |
| `cloudinaryAnalytics` | P | Keep | Default `true`. |
| `playedEventPercents`, `playedEventTimes` | P | Keep | |
| `profile` | P | Keep | Built-in name, saved name or raw URL (FR-037). `videoPlayer()` ignores it and warns, as v4. |
| `videoConfig` | P | Keep | Default `true` for `player()` and the element; ignored by `videoPlayer()`. |
| `lazy` | P | Keep | |
| `schedule` | P | Keep | Activation fixed (FR-025). |
| `debug` | P | Keep | |
| `maxTries`, `videoTimeout` | P | Keep | See the review below (D-09). |
| `interactionDisplay` | P | Remove | Feature removed (D-01). |
| `videojs` / `videoJS` | P | Remove | See the review below (D-30). |
| `html5` | P | Remove | See the review below (D-30). |
| `textTrackSettings` | P | Remove (5.x candidate) | See the review below. Not to be confused with `textTracks` (Keep). |
| `disableSeekWhileScrubbingOnMobile` | P | Remove (with its behavior) | See the review below. |
| `qualitySelector`, `ima` | P | Remove | See the review below (no effect in v4). |
| `fetchErrorUsingGet` | P | Keep | See the review below (D-09). |
| `_internalAnalyticsMetadata` | — | Internal | Not part of the public contract or schema. |

## `<video>` attributes (FR-036)

Only `data-cld-*` attributes and `autoplay`, `muted`, `loop`, `controls`, `playsinline`, `preload`, `poster` become options. `data-cld-public-id` → `publicId` (kebab to camel). Values: `"true"`/`"false"` → boolean, numeric strings → number, JSON objects/arrays parsed, otherwise string (fixes audit D: `"false"` stayed a string). Custom-element attributes: `contracts/element.md`.

## Video.js 8 options — one-by-one review (decided 2026-11-23)

The developer asked for an ROI judgement per option (2026-11-12). Decided 2026-11-23 as recommended, on the basis of existing answers: D-09 (keep v4 option names, avoid breaking customer pages) keeps every option that still has a meaning in v5; D-30 (no compatibility for Video.js 8 calls) removes the ones that only configured Video.js 8; options with no effect in v4 are removed. Facts are from the v4 code; "Usage data" means v4's usage report already sends the option (`src/utils/get-analytics-player-options.js`), so real customer use can be queried.

| Option | What it does in v4 (evidence) | Usage data | Cost in v5 | Value | Recommendation |
|---|---|---|---|---|---|
| `playbackRates` | Video.js 8 shows a speed menu when the list is set (`docs/ui-config.html:43`). | Yes | Very low: Video.js 10 has a public playback-rate button with a `rates` attribute. | Visible viewer feature; demo page. | **Keep** |
| `maxTries`, `videoTimeout` | Watchdog: if the video is not ready, re-check every `videoTimeout` (55 s) up to `maxTries` (3), then raise "Video is not ready" (`src/video-player.js:498,671`). | Yes | Low: about 15 lines in `core/errors.ts`. | An error instead of an endless spinner while Cloudinary prepares a new transformation. | **Keep** |
| `fetchErrorUsingGet` | After a media error, v4 probes the URL to read Cloudinary's error header: `HEAD` by default, `GET` with credentials when set (`src/utils/cloudinary.js:48`). | No | Very low if the probe stays (it does: FR-016): one branch. | Works where `HEAD` is blocked or private assets need cookies. Bug: v4 sends `Content-Range` instead of `Range`, so the "1 byte" GET is not limited. | **Keep**, fix the header. |
| `disableSeekWhileScrubbingOnMobile` | Video.js 8 flag, `true` by default in v4 (`src/config/defaults.js:41`): on touch, seek on release only. | No | None as an option; the behavior depends on the Video.js 10 slider. | Saves requests while scrubbing on phones. | **Remove the option and its behavior** (2026-11-26): Video.js 10 seeks while dragging on touch (S-7); the developer accepts it. Migration guide: list it as a behavior change. |
| `textTrackSettings` | Turns on the Video.js 8 caption-settings dialog: the viewer sets text, background and window color and opacity, font size, font family and edge style; off by default (`defaults.js:18`). | No | High: an own accessible dialog (Video.js 10 has none). | Viewer-controlled caption appearance; off by default and unmeasured. Caption configuration by the integrator is `textTracks`, which is Keep. | **Remove in 5.0**, debug warning; candidate for 5.x with the own caption renderer (S-3). |
| `html5` | Video.js 8 tech options; v4 sets `nativeTextTracks: false` (`defaults.js:37`). The HLS config inside it is overwritten by v4 (`adaptive-streaming.js:25`). | No | No equivalent: no tech layer in Video.js 10. | None in v5. | **Remove**, debug warning. |
| `videojs` | Copied into the Video.js 8 options (`src/video-player.utils.js:120`). | Yes (as `videoJS`) | No equivalent: Video.js 10 takes no options object. | `player.videojs` (FR-035) covers advanced use. | **Remove**, debug warning names `player.videojs`. |
| `videoJS` | In the schema, but **never applied**: v4 code reads only `videojs`. | Yes | None. | None (no effect today). | **Remove**, generic unknown-option message. |
| `qualitySelector`, `ima` | Accepted, **never read** (`src/video-player.const.js:52,58`). | No | None. | None (no effect today). | **Remove**, generic unknown-option message. |

## `schema.json`

Generated from `types.ts` at build time (ts-json-schema-generator or equivalent, R-01). `additionalProperties: true` at the top level (unknown options are reported, not rejected). Published in the package and on the CDN; `"./schema.json"` is in `exports` (decided 2026-11-12).

## Decisions taken after the plan draft

1. **Video.js 8 pass-through options.** Decided 2026-11-23: the recommendations in the review table above (basis D-09 and D-30).
2. **`schema.json` path.** Decided 2026-11-12: ship it in the package and on the CDN, and add `"./schema.json"` to `exports`.
