# Data model: Cloudinary Video Player v5

**Input**: `spec.md` (Key Entities, FR-001 to FR-041), `audit.md` (v4 defects), `contracts/`.

Every type below lives in the **core** (`src/core/`) and has no Video.js import, unless marked *layer*. TypeScript types are the single source of truth (D-11); `schema.json` is generated from `PlayerOptions` (see `contracts/options.md`).

All entities are plain, immutable data unless the entity says otherwise. "Immutable" means: created once by a pure function, never mutated; a change produces a new object. This removes the v4 defects where per-source options leaked into the player (audit E, `extendCloudinaryConfig`) and into the next source (audit D, `_transformation`).

---

## 1. PlayerOptions

The options contract. One definition per option: type, default, JSDoc description and example (FR-007).

| Field group | Fields (v4 names) | Notes |
|---|---|---|
| Cloud | `cloudName`/`cloud_name`, `cloudinaryConfig`, `secure`, `privateCdn`, `secureDistribution`, `cname` | Normalized once into `CloudConfig` (FR-006). |
| Source defaults | every `SourceOptions` field | Player-level defaults for each source. |
| Playback | `autoplay`, `autoplayMode`, `muted`, `loop`, `controls`, `playsinline`, `preload`, `playbackRates`, `fluid`, `bigPlayButton` | |
| UI | `skin`, `colors`, `fontFace`, `showLogo`, `logoImageUrl`, `logoOnclickUrl`, `showJumpControls`, `pictureInPictureToggle`, `chaptersButton`, `seekThumbnails`, `aiHighlightsGraph`, `hideContextMenu`, `floatingWhenNotVisible`, `playlistWidget` | |
| Features | `ads`, `analytics`, `cloudinaryAnalytics`, `playedEventPercents`, `playedEventTimes` | |
| Loading | `profile`, `videoConfig`, `lazy`, `schedule` | |
| Diagnostics | `debug`, `maxTries`, `videoTimeout` | |

Full disposition (keep / map / remove) per option: `contracts/options.md`.

**Validation rules**
- Normalization runs once, at entry, in `normalizeOptions(raw) → PlayerOptions` (FR-006). No module re-reads raw options.
- Unknown, deprecated, renamed and invalid options produce one debug report each (FR-008). The rename map is the same table that the migration guide prints and that saved profiles go through (FR-010).
- `api_secret`, `sign_url`, `auth_token`: dropped, with a console warning in every mode (FR-029).
- `PlayerOptions` is frozen after normalization.

## 2. CloudConfig

| Field | Type | Rule |
|---|---|---|
| `cloudName` | string | Required for public-ID sources. |
| `secure` | boolean | Default `true`. |
| `privateCdn`, `secureDistribution`, `cname` | optional | Same URL effects as v4. |

Never contains secrets. Accepted as `cloud_name` or `cloudName`, top level or inside `cloudinaryConfig` (FR-006). A source can override fields; the override produces a new `CloudConfig` and never changes the player's (FR-009).

## 3. SourceOptions → Source

`SourceOptions` is what the integrator passes to `source()` or to the factory. `Source` is the resolved, immutable result.

**SourceOptions fields (v4 names):** `publicId`, `type` (delivery type, default `upload`), `resourceType`, `transformation`, `sourceTransformation`, `rawTransformation`, `sourceTypes`, `breakpoints`, `maxDpr`, `aspectRatio`, `cropMode`, `cropPadColor`, `hdr`, `poster`, `posterOptions`, `textTracks`, `chapters`, `title`, `description`, `info`, `download`, `recommendations`, `videoSources`, `queryParams`, `withCredentials`, `adaptiveStreaming`, `allowUsageReport`, `autoShowRecommendations`, `cloudinaryConfig`.

**Source fields**

| Field | Type | Rule |
|---|---|---|
| `id` | string | Unique per `source()` call; used to drop stale async results ("last source wins"). |
| `kind` | `'video' \| 'audio' \| 'raw-url'` | `audio` from `sourceTypes: ['audio']`; `raw-url` from an absolute URL. |
| `publicId` / `url` | string | Exactly one is set. |
| `cloud` | `CloudConfig` | Player config merged with the source override. |
| `transformation` | `Transformation[]` | Only this source's transformation; never inherited from a previous source. |
| `renditions` | `Rendition[]` | Ordered by preference (FR-013 fallback). |
| `poster` | `Poster` | See §5. |
| `textTracks` | `TextTrackSpec[]` | See §6. |
| `chapters` | `ChaptersSpec \| null` | See §7. |
| `info` | `{ title?, subtitle?, description? }` | Plain text only (FR-030). |
| `withCredentials` | boolean | Applies to every request for this source (FR-015). |
| `features` | per-feature source options | `download`, `recommendations`, `videoSources`, `aiHighlightsGraph`. |

**Validation rules**
- `buildSource(options, playerOptions) → Source` is pure. It is the only place that merges player defaults with source options.
- An unknown key in source options never reaches the URL builder (fixes audit E, "leftover options bag").
- A raw URL is detected by the URL shape, not by `endsWith('.m3u8')` (fixes audit E; query strings allowed).

## 4. Transformation and Rendition

**Transformation**: a plain object (or array of objects for chained steps) with v4/SDK keys (`width`, `crop`, `effect`, `overlay`, `variables`, `if`, …) or a raw string. Serialized by the core URL builder (D-10). Key coverage: see `research.md` R-07.

**Rendition**

| Field | Type | Notes |
|---|---|---|
| `url` | string | Built by the core; identical to v4 for the same input (FR-011). |
| `mimeType` | string | For example `video/mp4; codecs="hev1"`, `application/x-mpegURL`, `video/auto`. |
| `sourceType` | string | v4 name: `auto`, `mp4`, `webm/vp9`, `hls`, `dash`, `audio`, `hdr`, … |
| `engine` | `'native' \| 'hls' \| 'dash'` | Selects the adapter (*layer*). |

The layer picks the first rendition the browser can play (`canPlayType` / `MediaSource.isTypeSupported`), then the next on error (FR-013).

## 5. Poster

| Field | Type | Notes |
|---|---|---|
| `url` | string | |
| `origin` | `'explicit' \| 'saved' \| 'image' \| 'waveform'` | Precedence below. |

**Precedence (FR-038)**
1. `poster` option set → `explicit`.
2. `kind === 'video'` and a public ID → `saved`: the video-service `elements/…/poster` URL (with `?tx=` for `posterOptions`). The service returns the saved poster or the default still.
3. `kind === 'audio'` → `waveform` (`fl_waveform`).
4. `raw-url` → none unless `posterOptions.publicId` is set (`image`).

**Rule**: the poster is chosen once per source. A per-asset configuration that arrives later changes the poster only if it sets `poster` or `posterOptions` (SC-012).

## 6. TextTrackSpec

| Field | Type | Notes |
|---|---|---|
| `kind` | `'captions' \| 'subtitles'` | |
| `label`, `language`, `default` | | |
| `origin` | `'vtt' \| 'srt' \| 'transcript'` | `transcript` = Cloudinary auto-generated (video service). |
| `url` | string | For `transcript`: the video-service URL, with optional language. |
| `options` | `{ theme?, fontFace?, fontSize?, gravity?, box?, style?, wordHighlight?, wordHighlightStyle?, maxWords?, timeOffset? }` | v4 `textTracks.options`; style values are applied as CSS properties, never as HTML (FR-030). |

**State (transcript)**: `pending` (HTTP 202, poll with back-off) → `ready` | `failed`. Polling stops on source change or dispose (FR-005).

Loading captions never removes chapters or thumbnail tracks (FR-018): each track is owned by the feature that added it.

## 7. ChaptersSpec

`true` (auto: video-service `chapters/…vtt`), a VTT URL, or an object `{ [seconds]: title }`. Resolved to a list of `{ start, end, title }`. Shown as seek-bar segments and in the optional chapters menu (`chaptersButton`).

## 8. Playlist

| Field | Type | Notes |
|---|---|---|
| `items` | `Source`-options list | Explicit, or from `playlistByTag` (client list resource). |
| `index` | number | |
| `autoAdvance` | `false \| number` | Seconds before the next item; `0` = at once. |
| `repeat` | boolean | |
| `presentUpcoming` | `false \| number` | Seconds before the end to show the upcoming overlay. |
| `widget` | `PlaylistWidgetOptions \| null` | v4 fields (`direction`, `total`, `show`, `selector`, `renderTo`, `useCustomLayout`, …). |

**State**: `loading` → `ready`. Calls to `playNext()` / `playPrevious()` / `playAtIndex()` while `loading` are queued and applied once (US6-2; fixes the v4 infinite recursion, audit D). Ad behavior per item follows `ads.adsInPlaylist`.

## 9. Overlay

The generic overlay feature (FR-039). Also used by the upcoming-video overlay and the recommendations end screen.

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `content` | `HTMLElement \| (() => HTMLElement) \| { title, text, image, actions }` | Elements are inserted as nodes; strings are set as text, never as HTML (FR-030). |
| `trigger` | `{ at: number } \| { beforeEnd: number } \| 'ended' \| 'manual'` | |
| `placement` | `'full' \| 'bottom' \| 'corner'` | |
| `dismissible` | boolean | Close button, `Escape`. |
| `pausesPlayback` | boolean | |

**State**: `hidden` → `shown` → `dismissed`. All overlays are removed on source change and on dispose. Focus moves into a shown modal overlay and returns on close (FR-019). API: `contracts/public-api.md`.

## 10. AdConfig

v4 `ads` options, unchanged: `adTagUrl`, `showCountdown`, `adLabel`, `locale`, `prerollTimeout`, `postrollTimeout`, `adsInPlaylist` (`'first-video' | 'every-video'`). States in `research.md` R-04.

## 11. Video service resources

All URLs are built in one core module, `src/core/video-service.ts` (D-08). Shapes and URLs: `contracts/video-service.md`.

| Resource | Used by | Result |
|---|---|---|
| Profile (named / built-in / raw URL) | `player()`, element | `{ playerOptions, sourceOptions }` |
| Per-asset configuration | `player()`, element | `{ playerOptions, sourceOptions }` |
| Saved poster | every entry point | image (302) |
| Chapters | chapters feature | VTT |
| Transcript | captions | transcript JSON (202 while pending) |
| Metadata | title/description | JSON |

## 12. Profile merge

`effectiveOptions = normalize(rename(profile.playerOptions) ∪ rename(profile.sourceOptions) ∪ localOptions)`; local options win (v4 order, `fetch-config.js`). A failed request yields `{}` and a debug message (spec edge case).

## 13. Player (*layer* + core)

| Field | Notes |
|---|---|
| `options` | Frozen `PlayerOptions`. Read-only; not the mutable v4 `options`. |
| `source` | Current `Source` or `null`. |
| `state` | Lifecycle below. |
| `videojs` | The Video.js 10 player element/store (FR-035); `undefined` before `ready`. |

**Lifecycle**

```text
created ──► (player()/element: fetching-config) ──► (lazy | scheduled: waiting) ──► loading ──► ready ──► disposed
                                                                                        │
                                                                                        └─► failed (target missing, load error)
```

- Calls made before `ready` are queued in order and applied at `ready` (FR-003). Rules per method: `contracts/public-api.md`.
- `dispose()` from any state stops all work: aborts fetches, clears timers and observers, removes listeners and added elements (FR-005, SC-010). Later async results are dropped.
- `scheduled: waiting` re-checks the window and moves on without a reload (FR-025).

## 14. PlayerEvent

`{ type: string, Player: VideoPlayer, eventData?: object }` — the v4 shape. The typed list of public events is in `contracts/events.md`; internal events are not part of it (FR-027).
