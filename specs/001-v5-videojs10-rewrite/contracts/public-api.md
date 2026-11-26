# Contract: public JavaScript API

**Requirements**: FR-001 to FR-005, FR-034, FR-035, FR-039, US1-4, US3-4/5, US6-2. **Decision**: D-07 (v4 shapes), D-30 (`player.videojs` hatch, minimal).

## 1. Entry points

| Function | Signature | Returns | Saved config (FR-010) |
|---|---|---|---|
| `videoPlayer` | `(target: string \| HTMLVideoElement \| CldVideoPlayer, options?: PlayerOptions, ready?: (player) => void)` | `VideoPlayer`, synchronously | Not requested (v4). `profile` set → console warning, as v4. |
| `videoPlayers` | `(selector: string, options?, ready?)` | `VideoPlayer[]`, synchronously | Not requested. |
| `player` | `(target, options?, ready?)` | `Promise<VideoPlayer>`; resolves after the saved profile / per-asset config is applied | Requested unless `videoConfig: false`. |
| `players` | `(selector, options?, ready?)` | `Promise<VideoPlayer[]>` | Requested per player. |
| `<cld-video-player>` | attributes, see `contracts/element.md` | `element.player: VideoPlayer` | Requested unless `video-config="false"` (spec assumption). |
| `defineElement()` | `(): void` | — | Registers `<cld-video-player>` once (npm). |

- `target` as a string is an element ID (v4), with or without `#`.
- Target not found, or not a `<video>` / `<cld-video-player>`: `videoPlayer()` throws `Error('cloudinary: element "<id>" not found or not a video element')`; `player()` rejects with the same error. No partial player.
- `lazy` and `schedule`: every entry point returns the **same** `VideoPlayer` object (not a stub, fixes audit D); its state is `waiting`, and calls queue as in §2.
- `Cloudinary.new()` and `videoPlayerWithProfile` (declared in v4 types, never shipped): removed (FR-034).

## 2. Before ready (FR-003, US1-4)

`VideoPlayer` is a real class in the ≤ 10 KB shell. The Video.js 10 player and the features load behind it.

| Call kind | Before `ready` | After `ready` |
|---|---|---|
| Actions and setters (`source`, `play`, `pause`, `stop`, `mute`, `unmute`, `set*`, `seek`, `playlist`, `playlistByTag`, `playNext`, `playPrevious`, `maximize`, `exitMaximize`, `addOverlay`) | Queued in call order, applied once at `ready`. Return value as after ready (chainable `this`, or a Promise that settles after the call runs). | Run at once. |
| `on`, `one`, `off`, `trigger` | Run at once on the shell's event target. Listeners get `playerload`, `ready`, `videoload` (FR-027). | Same. |
| Getters | Answer from the known state (table below). Never return the player object (fixes audit D). | Live values. |
| `dispose()` | Cancels setup, aborts fetches, drops the queue. Idempotent. | Full clean-up (FR-005). |

Getter answers before `ready`: `currentPublicId()` → last requested public ID; `currentSourceUrl()` → `''`; `currentPoster()` → poster URL (known synchronously, FR-038); `duration()` → `NaN`; `getCurrentTime()` → `0`; `getVolume()` → `1` (`0.4` if `muted`); `isMuted()` → `options.muted`; `isMaximized()` → `false`; `el()` → the root element; `videojs` → `undefined`.

**Chaining.** Every action and setter returns the `VideoPlayer` (fixes the v4 chain bug, audit D).

## 3. `VideoPlayer` methods

**Policy** (FR-004): one purpose and one typed signature per method. Combined v4 getter/setters are split or removed (decided 2026-11-12); action methods keep their v4 names.

| v4 method | v5 | Notes |
|---|---|---|
| `source(publicIdOrUrl, options?)` | Keep | Returns `this`. Last call wins; earlier loads are aborted. |
| `play()`, `pause()`, `stop()` | Keep | `play()` returns `this` (v4); playback errors arrive as `error` events. |
| `mute()`, `unmute()`, `isMuted()` | Keep | |
| `maximize()`, `exitMaximize()`, `isMaximized()` | Keep | Fullscreen. |
| `duration()` | Keep | Getter. |
| `dispose()` | Keep | |
| `el()` | Keep | Root element (`<cld-video-player>` or the wrapper around the `<video>`). |
| `currentPublicId()`, `currentSourceUrl()`, `currentPoster()` | Keep | `currentPoster()` returns the URL string (v4 returned an internal `ImageSource`). |
| `on`, `one`, `off`, `trigger` | Keep | Typed by `PlayerEventMap` (`contracts/events.md`). |
| `playlist(sources, options?)` | Keep | Returns `this`; `player.playlist()` with no arguments returns the `Playlist` (§4). |
| `playlistByTag(tag, options?)`, `sourcesByTag(tag, options?)` | Keep | Return Promises (v4 docs). |
| `playNext()`, `playPrevious()` | Keep | Queued while the playlist loads; never recurse (fixes audit D). |
| `volume(v?)` | Split → `getVolume()`, `setVolume(v)` | Fixes `volume(0)` acting as a getter. |
| `currentTime(t?)` | Split → `getCurrentTime()`, `seek(t)` | |
| `loop(b?)`, `controls(b?)`, `fluid(b?)` | Split → `isLooping()`/`setLoop(b)`, `hasControls()`/`setControls(b)`, `isFluid()`/`setFluid(b)` | |
| `width(n?)`, `height(n?)` | Remove | Size is set with CSS (or `fluid`). Fixes `width(0)` acting as a getter. |
| `skin(name?)` | Split → `getSkin()`, `setSkin(name)` | Only `dark`/`light` switch at run time. |
| `transformation()`, `sourceTypes()`, `sourceTransformation()`, `posterOptions()`, `autoShowRecommendations()`, `cloudinaryConfig()` | Remove | They changed player-wide source defaults at run time (the root of audit D/E leaks). Pass them as options or per `source()` call. |
| `setTextTracks(conf)` | Remove | Pass `textTracks` to `source()`. |
| `ima()` | Remove | The `videojs-ima` object no longer exists. |
| `getVPInstanceId()`, `reTryVideoStateUntilAvailable()`, `reloadVideoUntilAvailable()`, `options` (mutable) | Remove from public | Internal. `player.options` becomes a frozen, read-only copy. |
| `videojs` | Keep (changed) | The Video.js 10 player (FR-035): escape hatch, no stability promise, `undefined` before `ready`. |

New in v5: `addOverlay(spec)` (§5).

## 4. `Playlist` object

| v4 method | v5 |
|---|---|
| `playAtIndex(i)`, `playFirst()`, `playLast()`, `playNext()`, `playPrevious()`, `list()`, `length()`, `currentSource()`, `player()` | Keep |
| `currentIndex(i?)` | `currentIndex()` getter; set with `playAtIndex(i)` |
| `repeat(b?)`, `autoAdvance(delay?)`, `presentUpcoming(delay?)` | Getters keep the name; setters become `setRepeat(b)`, `setAutoAdvance(delay)`, `setPresentUpcoming(delay)` (same policy as §3) |

## 5. Overlay API (FR-039, new)

```ts
player.addOverlay(spec: OverlaySpec): Overlay

interface OverlaySpec {
  id?: string;
  content: HTMLElement | (() => HTMLElement) | { title?: string; text?: string; image?: string; actions?: { label: string; onClick: () => void }[] };
  trigger?: { at: number } | { beforeEnd: number } | 'ended' | 'manual';   // default 'manual'
  placement?: 'full' | 'bottom' | 'corner';                               // default 'full'
  dismissible?: boolean;                                                   // default true
  pausesPlayback?: boolean;                                                // default false
}

interface Overlay { show(): void; hide(): void; remove(): void; readonly visible: boolean }
```

- Strings are rendered as text, never HTML (FR-030). Elements are inserted as given (the integrator owns their content).
- Keyboard: focus moves into a `full` overlay and returns on close; `Escape` closes a dismissible overlay (FR-019).
- Overlays are removed on source change and on dispose (US7-3). The upcoming-video overlay and the recommendations end screen use this API (FR-021).
- Final shape is confirmed by the overlay spike (research R-06).

## 6. `player.videojs` (FR-035, D-30)

The Video.js 10 player element and its store, as created by the layer. Documented as an escape hatch: no types beyond Video.js 10's own, no compatibility with v4 calls, may change in any minor release.
