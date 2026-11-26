# Contract: player events

**Requirements**: FR-027, US9. **Sources**: Cloudinary Video Player API reference ("Events" section; read 2026-11-11 through a summary — re-check names during implementation), `docs/api.html`, `types/cld-video-player.d.ts`, `src/extended-events.js`, `src/utils/consts.js`.

## Rules

1. The public events are one typed list: `src/core/events.ts` exports `PlayerEventMap` (event name → payload type). `on`, `one`, `off` are typed against it. Only events in this list are public (FR-027).
2. Handler shape stays v4: `handler(event)` where `event = { type, Player, eventData? }` (`.d.ts` `VideoPlayerEvent`).
3. Listeners attached right after creation (also on the object `videoPlayer()` returns before ready) receive `playerload`, `ready` and `videoload` (FR-027, US9-2). The shell queues `on`/`one` calls and attaches them before the player emits anything.
4. Extended events fire once per playback of a source, and reset on source change (US9-1).
5. Internal coordination between features does **not** use player events. Features use the typed internal bus in the layer (`research.md` R-03); those events are not in this list.

## Public events

### Media events (forwarded from the media element)

`loadstart`, `suspend`, `abort`, `error`, `emptied`, `stalled`, `loadedmetadata`, `loadeddata`, `canplay`, `canplaythrough`, `playing`, `waiting`, `seeking`, `seeked`, `ended`, `durationchange`, `timeupdate`, `progress`, `play`, `pause`, `ratechange`, `volumechange` — no `eventData`.

`fullscreenchange` — from the player container. `posterchange` — when the poster URL changes.

### Cloudinary events

| Event | `eventData` | When | v4 status |
|---|---|---|---|
| `playerload` | — | Player created and listeners attached. | Emitted by default, not in the API reference. Keep. |
| `ready` | — | Player ready for calls. Also the third factory argument (`ready` callback). | Keep. |
| `videoload` | — | First `loadedmetadata` of each source. | Emitted by default. Keep. |
| `start` | — | First `play` of each source. | Emitted by default. Keep. |
| `pausenoseek` | — | `pause` that is not part of a seek. | Emitted by default. Keep. |
| `seek` | `{ seekStart, seekEnd }` | After a seek ends. | Documented. Keep. |
| `mute` / `unmute` | — | Muted state changes. | Documented. Keep. |
| `percentsplayed` | `{ percent }` | Each value in `playedEventPercents` (default 25, 50, 75, 100). | Documented. Keep. |
| `timeplayed` | `{ time }` | Each value in `playedEventTimes`. | Documented. Keep. |
| `qualitychanged` | `{ from, to }` | Adaptive rendition changes (video height and width). | Documented. Keep. |
| `sourcechanged` | `{ source, sourceOptions }` | After `source()` resolves a new source. | Documented, with no documented payload. Keep; it absorbs the internal `cldsourcechanged` and its payload (one source event, audit G). |
| `error` | `{ code, message, statusCode? }` | Media or Cloudinary error. | Change: v4 exposed details only through `e.Player.videojs.error_`; `player.videojs` is now Video.js 10, so details move to `eventData` (migration guide). |
| `dispose` | — | Player removed. | Keep (used in demos). |

### Playlist events

| Event | `eventData` | v4 status |
|---|---|---|
| `playlistcreated` | — | Keep. |
| `playlistitemchanged` | `{ playlist, current, next }` (v4 shape) | Keep. |
| `upcomingvideoshow` / `upcomingvideohide` | — | Keep (now from the overlay feature). |

### Ads events

The IMA SDK ad events are forwarded with the v4 names that `videojs-ima` produced (`ads-ad-started`, `ads-pod-ended`, `adstart`, `adend`, `adskip`, `adserror`, …). The exact list is fixed in `research.md` R-04 after the spike; each forwarded name is listed here before 5.0.

## Removed from the public surface

| v4 event | Reason |
|---|---|
| `cldsourcechanged` | Internal duplicate of `sourcechanged`. Removed; listed in the migration guide. |
| `refresh`, `refreshTextTracks`, `retryplaylist`, `PlaylistPanel`, `fluid`, `resize` | Internal. |
| `productBarMin`, `productBarMax`, `productClick`, `productHover`, `showProductsOverlay`, `shoppableitemchanged`, … | Shoppable removed (D-01). |
| Video.js 8 component events (`playerresize`, `useractive`, …) | Video.js 8 only. |
