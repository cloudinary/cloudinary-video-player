# Contract: `<cld-video-player>` custom element and `<video>` attributes

**Requirements**: FR-001, FR-010, FR-036, US1-2, US8-4. **Decisions**: D-07, D-09, D-05 (no framework wrappers; docs show the element in React, Vue and Svelte).

## Custom element

```html
<cld-video-player cloud-name="demo" public-id="cld-sample-video" controls muted></cld-video-player>
```

| Item | Contract |
|---|---|
| Tag | `cld-video-player`. Registered by the CDN loader, or by `defineElement()` on npm. |
| Attributes | Kebab-case of any `PlayerOptions` key (`cloud-name` → `cloudName`, `public-id` → `publicId`, `video-config` → `videoConfig`). Same value parsing as `data-cld-*` below. |
| Object options | JSON in the attribute (`colors='{"accent":"#ff0"}'`) or the `options` property set before the element connects. Property wins over attributes. |
| Saved config | Applied like `player()` (`video-config` defaults to on; spec assumption). |
| `player` property | The `VideoPlayer` (`contracts/public-api.md`); available synchronously after connect, with the same before-ready queue. |
| Live attributes | Only `public-id` is observed: a change calls `player.source(newId)`. Other attributes are read once at connect (documented). |
| DOM events | Every public event (`contracts/events.md`) is also dispatched on the element as a `CustomEvent` with the same name and `detail = eventData`, so frameworks can use `addEventListener` / `onPlay`. |
| Children | Optional `<video>` child (to set native attributes or `<source>` fallbacks); created if absent. `<track>` children are ignored in 5.0 (use `textTracks`). |
| Lifecycle | `connectedCallback` creates the player. `disconnectedCallback` disposes it, unless the element is re-attached in the same task (a move). |
| Styling | Block-level by default with `aspect-ratio: 16 / 9`; sized with normal CSS. The skin's CSS variables (`--color-*`) can be set on the element. |
| Shadow DOM | None in 5.0: Video.js 10 skins and the v4 classes rely on light-DOM CSS. *(Revisit after the skin spike, R-05.)* |

## `<video>` element with a factory (v4 path)

```html
<video id="player" class="cld-video-player" controls muted data-cld-public-id="cld-sample-video"></video>
<script>cloudinary.videoPlayer('player', { cloudName: 'demo' });</script>
```

| Source of options | Becomes an option |
|---|---|
| `data-cld-*` attributes (`data-cld-public-id`, `data-cld-colors`, …) | Yes, kebab → camel. |
| `autoplay`, `muted`, `loop`, `controls`, `playsinline`, `preload`, `poster` | Yes, native meaning. |
| `class`, `id`, `style`, `width`, `height`, any other attribute | No (FR-036; v4 turned every attribute into an option). The `<video>` keeps them as normal attributes. One v4 exception stays: class `cld-fluid` or `vjs-fluid` sets `fluid: true`. |

**Value parsing** (both paths): `""` (present boolean attribute), `"true"` → `true`; `"false"` → `false`; numeric string → number; string starting with `{` or `[` → `JSON.parse` (invalid JSON → debug error, option skipped); otherwise the string.

**Precedence**: factory `options` argument > `data-cld-*` / element attributes > saved configuration (`contracts/video-service.md`) > defaults.
