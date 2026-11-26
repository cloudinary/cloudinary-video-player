# S-3 · Own caption renderer with word highlight, native captions in iPhone fullscreen (T006)

## Question

Can v5 render captions itself (v4 styles plus word highlight) on top of Video.js 10, and still show native captions in iPhone native fullscreen?

## Method

- **Versions.** `@videojs/html`, `@videojs/core`, `@videojs/hlsjs-video` **10.7.0** (the plan pins 10.3.0), hls.js 1.7.4, rolldown 1.3.3, Playwright 1.60.
  The caption code that matters was also checked in the 10.3.0 bundle (`spikes/s1-size/dist/10.3.0`). `showOnly()` (writes only `showing`/`disabled`) and the `subtitlesShowing` rule (any caption track `showing`) are the same. `store.addTextTrack()` and `watchTextCues()` exist only in 10.7.
  The define-order gotcha (below) was also reproduced on 10.3.0 with the S-1 `v4-controls` bundle. The hls.js text-track bridge is not in the S-1 bundles, so its behavior is **not verified for 10.3.0**.
- **Engines.** Playwright headless Chromium 148, Firefox 150 and WebKit 26.4 on macOS.
- **Media.** Cloudinary demo `sea_turtle.mp4` (needs network). For the HLS check, Apple's public "bipbop advanced" stream (one WebVTT subtitles group, `DEFAULT=YES`) played by hls.js through `<hlsjs-video>` (`engineName` is `hlsjs` in all three engines).
- **Fixture.** `transcript.json` uses the v4 transcript shape (`[{ transcript, words: [{ word, start_time, end_time }] }]`). `run.mjs` converts it the way v4's `transcriptParser` does with `wordHighlight: true` and `maxWords: 3`. The result is one cue per word with that word in `<b>`, plus a cue without highlight for the gap between two words. It is written to `captions.vtt` (11 cues) and attached with `<track default>`. A second track (Spanish) is added with `media.addTextTrack()` and `VTTCue`.
- **Page (`page.js`).** `createPlayer({ features: videoFeatures })` with `<media-container>`, the built-in captions and fullscreen buttons, and `<media-hotkey keys="c">`. The controls are there only for the interference test. `createCaptions()` is the renderer under test.
- **Run.** `node spikes/s3-captions/run.mjs [chromium firefox webkit]` from the repository root, a few minutes per engine (the HLS probes use two page loads). It bundles `page.js` in memory, serves it from `node:http`, drives each engine, prints a summary and writes `results.json`.

## Results

| # | Exit criterion | Chromium | Firefox | WebKit | Verdict |
|---|---|---|---|---|---|
| 1 | Own overlay renders the active cues of a `hidden` track on `cuechange`. It applies the v4 options (theme, fontFace, fontSize, gravity, box, style, wordHighlightStyle) and highlights the current word. It sits above the media and inside the fullscreen container. | yes | yes | yes | **yes** |
| 2 | Interference with `hidden` checked: Video.js 10 never changes a mode by itself, but every built-in caption control and `subtitlesShowing` treat `hidden` as "off". So v5 needs its own captions menu (the plan assumption). | passive: no change; controls: override | same | same | **yes** (own menu needed, sketched below) |
| 3 | iPhone native fullscreen: `hidden` → `showing` on `webkitbeginfullscreen`, back on `webkitendfullscreen` | yes (simulated) | yes (simulated) | yes (simulated) | **yes** for the switching code; **not verified here** on a real iPhone (needs a device) |
| 4 | Renderer check in the three current engines | yes | yes | yes | **yes** |

### Criterion 1 and 4: what was asserted (each engine)

- **Text and word.** Seek to the midpoint of each of the 11 cues and to 3 times with no cue. Assert the overlay text, the highlighted word and the gap cue with no highlight: 14/14 pass.
- **Styles (computed).** Theme `yellow-outlined` gives color `rgb(254, 249, 74)` and a text shadow. `style` gives background `rgba(0, 0, 128, 0.8)`. `fontFace` gives `Georgia, serif`, and `fontSize: 150%` gives 27px. `wordHighlightStyle` gives `royalblue` and an underline on the `<b>`. `getCueAsHTML()` returns a real HTML `<b>` in all three engines.
- **Paint and fullscreen.** Screenshot diffs show the overlay paints over a painting video. A real element fullscreen through `<media-fullscreen-button>` goes to `<media-container>`, the overlay is inside it at viewport size, and the text stays shown.
- **Layout, as a fraction of the container.** Cue center Y is 0.84 for `bottom`, 0.13 for `top` and 0.48 for `center`. The right gap for `bottom-right` is 4%. `box {x:10%, y:10%, w:50%, h:50%}` gives an overlay of 50% × 50% at 5%/5%. The offset is a `translate` relative to the overlay's own size, as in v4.

### Criterion 2: what Video.js 10 does to a `hidden` track

Before each step: `en` is `hidden` (ours, overlay shows "Sea turtles glide") and `es` is `disabled`. The results were identical in all three engines.

| Step | Modes after | `subtitlesShowing` | Built-in button | Our overlay |
|---|---|---|---|---|
| Play 1 s, pause, seek | unchanged | false | off | shown |
| New `src` on the media (with `<track default>`) | unchanged | false | off | shown |
| `store.toggleSubtitles()` / `toggleSubtitles(true)` | `en` showing | true | on | cleared (native paints) |
| `store.toggleSubtitles(false)` | all disabled | false | off | cleared |
| `store.selectSubtitlesTrack(esId)` | `es` showing, `en` disabled | true | on | cleared |
| `store.selectSubtitlesTrack(null)` | all disabled | false | off | cleared |
| Click `<media-captions-button>` | `es` showing (the last track shown) | true | on | cleared |
| `<media-hotkey keys="c" action="toggleSubtitles">` | `es` showing | true | on | cleared |
| Button clicked twice, with our "claim `showing`" policy on | `es` hidden both times | false | off | shown: the button turns captions on, never off |

- **Conclusion.** Video.js never changes a mode by itself. Every caption control, though, treats `hidden` as "off":
  - `subtitlesShowing` is false while our captions show.
  - `toggleSubtitles()`, `selectSubtitlesTrack()`, the button, the radio group and the `c` hotkey write only `showing`/`disabled`, so native rendering comes back.
- **So v5 needs its own captions menu, button, `c` hotkey and on/off state, as the plan assumes.** The ejected skin must leave out `<media-captions-button>`, `<media-captions-radio-group>`, `<media-hotkey action="toggleSubtitles">` and the captions status indicator, because each one reads `subtitlesShowing`.
- **Menu sketch.** An own `UIElement` in the ejected skin:
  - Items are "Off" plus the caption and subtitle tracks of `media.textTracks` (label, with a CC/SUB badge on duplicate labels, as in v10).
  - The checked item comes from `captions.active`.
  - Picking an item calls `captions.select(track | null)`.
  - The `c` key toggles between off and the last selected track.
  - The menu hides when no caption track exists (`addtrack`/`removetrack`).
  - It works on the native `TextTrack`s, so the `textTrackList` id mapping (`track.id` or `track:<index>:<kind>:<lang>:<label>`) is not needed.
- **hls.js in-manifest subtitles (also Video.js 10 interference).** `<hlsjs-video>` sets hls.js `engine.subtitleTrack` only from a `showing` track (`text-tracks.js` in `@videojs/hlsjs-video`, 10.7.0; not verified for 10.3.0). Each probe plays 6 s from the given time. The claim-on probe and the claim-off probes use separate page loads, so cues loaded by one do not leak into the other.

  | State (page load) | `engine.subtitleTrack` | Cues near the playhead | Overlay | Engines |
  |---|---|---|---|---|
  | `DEFAULT=YES` track, claim policy on from load (the v5 path) | 0 | 14 | "Subtitles: Bop!" | all three |
  | `hidden` only, `subtitleTrack` set to -1 (claim off) | -1 | 0 | empty | Chromium, Firefox |
  | `hidden` + our `engine.subtitleTrack = 0` (claim off) | 0 | 15 | "Subtitles: Bop!" | Chromium, Firefox |
  | `showing` (what the built-in controls do) | 0 (set by the bridge) | 15 | empty (native) | all three |

  - So `select()` must also set `media.engine.subtitleTrack` when the user picks an HLS track that hls.js has not selected. `engine` is the documented "escape hatch".
  - The `DEFAULT=YES` track starts `showing` with `subtitleTrack` 0, and the claim policy adopts it as `hidden` with cues still loading.
  - **WebKit race.** The track was still `disabled` when our setup ran. After we set `hidden` and `subtitleTrack = -1`, it came back `showing` with `subtitleTrack` 0, so the two claim-off rows are not a clean measurement in WebKit. We infer that hls.js applied its default selection late (with `subtitleDisplay` true, hls.js writes `showing`); not traced. With the claim policy on, WebKit gives the same result as the other engines. So hls.js wrote `showing` once, late after load, in WebKit, and v5 must keep the claim policy on.
  - hls.js's own text-track change handler (in `hls.mjs`) can select a `hidden` track when no track is `showing`. In Chromium and Firefox it had no effect (`subtitleTrack` stayed -1), so the requirement above stands as measured. Why it did not apply was not traced.
- **10.7 app tracks.** With `store.addTextTrack({ kind: 'captions' })`, the media copy is set from `hidden` back to `disabled` when its `<track>` settles (within 500 ms, all engines), so it must be set again. After that the overlay was empty in Chromium and WebKit, which was not investigated. On 10.3.0 this API does not exist.

### Criterion 3: simulated iPhone native fullscreen (all three engines pass)

The events were dispatched on the `<video>`. With `<hlsjs-video>` (HLS page, claim on), the events were dispatched on its inner `<video>` and our listener on `<hlsjs-video>` got them through its event bridge: begin gave `showing` with an empty overlay, end gave `hidden` again (all three engines).

| Step | Result |
|---|---|
| Inline | `en` hidden, overlay shows the cue |
| `webkitbeginfullscreen` | `en` `showing`, overlay empty, `subtitlesShowing` true |
| `webkitendfullscreen` | `en` `hidden` again, overlay shows the cue |
| Native menu picks Spanish (simulated mode writes), then end | `es` `hidden`, `en` disabled, overlay shows Spanish |
| Native menu "Off", then end | all disabled, overlay empty |
| Captions off; native menu turns `en` on, then end | `en` `hidden`, overlay shows it |

A screenshot diff confirms the browser draws the track once it is `showing` (desktop engines). No Video.js code listens to `webkitbeginfullscreen`/`webkitendfullscreen` (grep in core, media and utils). The store's `isFullscreen` follows `webkitpresentationmodechanged`.

### Key numbers

- **Highlight timing at 1x**, measured as `currentTime − cue.startTime` when a word cue renders, with `cuechange` only and no rAF:

  | Engine | Median (across runs) | Max (across runs) | Note |
  |---|---|---|---|
  | Chromium | 1–5 ms | 4–9 ms | |
  | Firefox | 18–24 ms | 36–55 ms | |
  | WebKit | 1–2 ms | 246–251 ms | the max is the first cue after playback started 0.5 s earlier; after that ≤ 6 ms |

  11/11 cues rendered in every engine, including a 100 ms cue.
- **Gotcha (affects all overlays).** If `<media-container>` is defined before the player element, it never registers. `requestFullscreen()` then falls back to the `<video>`, and the overlay is not in fullscreen. In this spike the `c` hotkey also did nothing in that order. Seen on 10.3.0 and 10.7.0. Static `import '@videojs/html/ui/container'` runs before the module body, so the S-1 `v4-controls` entry has this bad order too. Fix: define the player first, then import the UI elements (see `page.js`).
- **WebKit quirk.** After a paused track goes `disabled` → `hidden`, a seek to the *same* time leaves `activeCues` empty, with no `cuechange` for at least 1.5 s. No seek, or a seek to another time, works. The native renderer reads the same `activeCues`, so we infer a WebKit bug, not ours (not proven).

## Code sketch (mechanism for v5)

```js
// Our captions menu is the only writer of caption modes: the selected track `hidden`, the rest `disabled`.
function createCaptions({ media, video = media, container, options, pacedTracks }) { // video: where webkit*fullscreen fires
  const overlay = Object.assign(document.createElement('div'), { className: `cld-cc cld-cc-theme-${options.theme}` });
  container.append(overlay);                          // child of <media-container>: above media, inside fullscreen
  let active = null, native = false, listener = null;
  const render = () => {
    overlay.replaceChildren();
    for (const cue of active?.mode === 'hidden' ? active.activeCues : []) {
      const el = document.createElement('div');
      setStyle(el, options.style);                    // CSSOM setProperty: CSP-safe, unlike v4's <style>
      el.append(cue.getCueAsHTML());                  // browser-parsed WebVTT markup, never innerHTML
      if (pacedTracks.has(active)) el.querySelectorAll('b').forEach((b) => setStyle(b, options.wordHighlightStyle));
      overlay.append(el);
    }
  };
  const select = (track) => {                         // called by our menu and the `c` hotkey
    listener?.abort(); active = track;
    captionTracks(media).forEach((t) => { t.mode = t === track ? 'hidden' : 'disabled'; });
    if (media.engine) media.engine.subtitleTrack = hlsIndexOf(media.engine, track); // -1 when off or not HLS
    if (track) track.addEventListener('cuechange', render, { signal: (listener = new AbortController()).signal });
    render();
  };
  media.textTracks.addEventListener('change', () => { // browser `default`, hls.js DEFAULT=YES: adopt as ours
    const showing = captionTracks(media).find((t) => t.mode === 'showing');
    if (showing && !native) select(showing); else render();
  });
  video.addEventListener('webkitbeginfullscreen', () => { native = true; if (active) active.mode = 'showing'; render(); });
  video.addEventListener('webkitendfullscreen', () => { native = false; select(captionTracks(media).find((t) => t.mode === 'showing') ?? null); });
  return { select, get active() { return active; } };
}
```

`hlsIndexOf` matches `engine.subtitleTracks[i]` by `lang` and `name` (public hls.js API). The bridge's own mapping is internal. The `engine.subtitleTrack` line and `hlsIndexOf` are untested as written: `page.js` has no such line, and only a manual `engine.subtitleTrack = 0` was measured (Chromium and Firefox, 10.7.0).

## Device / floor checklist (a person must still check these)

1. **iPhone Safari.** `<media-fullscreen-button>` → native fullscreen fires `webkitbeginfullscreen` on the `<video>`, and reaches our listener also when the media is `<hlsjs-video>`. Its event bridge forwards any listened event type from the inner `<video>` (read in `@videojs/media` `html-media-adapter.js`, checked here with simulated events only). The probe added the listener after `media.engine` existed. The adapter forwards with `this.target?.addEventListener`, so check also a listener added before the inner `<video>` attaches. Captions show at once in native fullscreen after the switch to `showing`, with no flash and no missing first cue. On exit, the overlay comes back.
2. **iPhone native captions menu.** Pick another language, or Off, in native fullscreen. On exit, our overlay and menu follow it.
3. **iPhone native look.** In native fullscreen, check whether page `::cue` / `video::cue(b)` CSS applies (v4 relies on it for the word highlight). If it does not, the highlight shows only as bold or not at all.
4. **iPhone with HLS on native playback** (`<hlsjs-video>` without MSE). Does a `hidden` in-manifest track still load cues (AVFoundation legible selection)? Does `engine` stay `null`, so the hls.js workaround is skipped?
5. **Safari on macOS and iOS with Accessibility → Subtitles & Captioning** (custom style, "Closed Captions + SDH"). Does Safari force a track to `showing`? The claim policy would adopt it. Do user caption styles need to apply to our overlay?
6. **iPad.** Element fullscreen of `<media-container>`: the overlay is visible and no switch happens.
7. **Picture-in-picture (Safari, Chrome) and AirPlay / remote playback.** Our overlay is not in the PiP window or on the TV. Decide whether to switch to `showing` there as well (`webkitpresentationmodechanged`, `enterpictureinpicture`).
8. **Android Chrome.** Element fullscreen with rotation, overlay size and font size.
9. **Browser floor (Safari 16.4).** Check `getCueAsHTML`, the CSS `translate` property (used for `box`), `AbortSignal` in `addEventListener`, and `cuechange` on `hidden` tracks.
10. **Screen readers.** The overlay is `aria-live="off"`, as in Video.js 8. Confirm that captions are not read twice.

## Open questions for the developer

1. **Version.** The pin is 10.3.0 and this spike used 10.7.0. The conclusions hold for both (same caption code), but 10.7's `store.addTextTrack()` copy fights a `hidden` mode. On 10.3.0, how does v5 add removable tracks for transcripts and SRT? `media.addTextTrack()` tracks start `hidden` and can never be removed. A `<track>` without `src` plus `addCue()` after it settles is what Video.js does internally.
2. **Highlight precision.** `cuechange` alone is within about 40 ms, except that the first cue after playback starts can be up to 250 ms late in WebKit. Is that acceptable? If not, add a rAF loop that computes active cues from `track.cues` while playing. That loop would also cover the WebKit quirk above.
3. **Word-timing encoding.** Keep v4's per-word cues with `<b>` (tested here; the native fallback still shows bold), or use one cue per phrase with WebVTT timestamp tags (`<00:01.300>`)? The second gives fewer cues, needs our own timing loop, and native rendering shows no highlight.
4. **VTT cue settings** (`line`, `position`, `align`, `size`) are ignored by this renderer, and customers' own `::cue` CSS no longer applies. Support a subset, or document the change?
5. **Not covered here.** Moving bottom captions above visible controls (`controlsVisible`), scaling the font with player size (Video.js 8 scaled it), and `fontFace` loading (v4 loads Google fonts).
6. **v4 bug to avoid in the v5 converter.** `src/plugins/text-tracks-manager/parsers/transcriptParser.js` checks gaps with `words[idx + 1]`, where `idx` is the chunk index. With `maxWords` set, gap cues after the first chunk are wrong. `run.mjs` uses the absolute index.
7. **Element definition order.** Should we report this to Video.js, or only enforce it in our loader? It also matters for S-7 (overlays) and for the S-1 `v4-controls` entry, which has the bad order.
8. **hls.js `subtitleDisplay`.** hls.js 1.7.4 has a public `hls.subtitleDisplay` property. When it is `false`, hls.js writes `hidden` instead of `showing` for the track it selects (read in `hls.mjs`). Setting `media.engine.subtitleDisplay = false` may remove the WebKit race and the claim step for HLS. Not verified here.
