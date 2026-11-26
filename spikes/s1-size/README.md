# S-1 · Size baseline

**Question.** Can the default v5 player fit the SC-007 budget (60 KB gzip start, never more than 70 KB)? Same measure as the budget: shell + core + layer + Video.js 10 with `videoFeatures` + skin script and default CSS + English strings; no streaming engine, no ads, no optional feature.

**Method.** `node spikes/s1-size/build.mjs` bundles each file in `entries/` with Rolldown (minified ESM, browser) and gzips the first-load code at level 9 (`node:zlib`); lazy chunks (locale packs, VTT parser) are listed apart. `node spikes/s1-size/breakdown.mjs <entry>` splits one bundle by package. Own code (shell, core, layer) is not written yet, so it is stood in for by the 15 KB allowance. Results: `results-10.7.0.json`, `results-10.3.0.json`.

## Results (gzip KB, first load)

| Entry | What it is | 10.3.0 | 10.7.0 |
|---|---|---|---|
| `features-only` | `createPlayer({ features: videoFeatures })`, no UI | 12.5 | 16.6 |
| `default` | packaged Default skin (all its controls, CSS inlined in JS) | 76.1 | 82.1 |
| `compat` | packaged Compat skin | 75.3 | 80.2 |
| `scaffold` | packaged Scaffold skin | 72.7 | 77.6 |
| `v4-controls` | only the v10 controls v4 has by default, menus included; no CSS | 46.2 | 50.4 |
| `v4-controls-lazy-menus` | as above, minus the controls that only appear with an optional feature (quality, audio, rate and captions menus; chapters) | 29.7 | 33.7 |
| `skin-template-and-icons` | Default skin markup with its inline SVG icons (upper bound) | 2.4 | 2.5 |
| Default skin CSS alone (`skin.css`) | upper bound for the v4-look CSS | 10.6 | 11.4 |

Where it goes (10.7.0 Default skin, minified share): UI components ≈ 46 %, skin CSS ≈ 13 %, store and features ≈ 15 %, utilities ≈ 7 %, i18n ≈ 4 %, icons ≈ 3 %. The menu components alone cost ≈ 16.7 KB gzip.

## Default player estimate (10.7.0)

| Design | Video.js JS | CSS | Markup + icons | Own code allowance | **Total** | Gate |
|---|---|---|---|---|---|---|
| A. All v4 controls in the first load | 50.4 | 11.4 | 2.5 | 15 | **79.3** | > 70: stop |
| B. Feature menus load with their feature chunk | 33.7 | 11.4 | 2.5 | 15 | **62.6** | 60–70: go with a plan note |

Same designs on 10.3.0: A = 74.7, B = 57.7. Video.js grew ≈ 4 KB gzip from 10.3.0 to 10.7.0.

Totals add separately gzipped files (code and CSS ship as separate files), so they are a little higher than one combined file.

## Result

- **Packaged skins: no.** Every packaged skin is above 70 KB before any own code.
- **Own (ejected) skin with design B: yes, with a plan note** (62.6 KB on 10.7.0). The quality and audio menus move into the adaptive-streaming chunk, the rate menu loads when `playbackRates` is set, captions and chapters menus load with their features. This matches the plan's lazy feature modules (T071, T093, T094), so it changes no task.
- **Design A: no** (79.3 KB). It needs a budget decision if the menus must be in the first load.
- **Not verified here:** the v4-look CSS size (the Default skin CSS stands in for it) and the real own-code size (15 KB allowance). T127 re-measures with real numbers.

## hls.js adapter chunk (for T011)

`node spikes/s1-size/hls-chunk.mjs` measures what design B adds when an HLS source loads: `<hlsjs-video>` plus the quality and audio menus, on top of `v4-controls-lazy-menus`.

| Part (gzip KB, 10.7.0, hls.js 1.7.4) | Size |
|---|---|
| hls.js full build alone | 173.9 |
| hls.js light build alone (no alt audio, subtitles, EME, CMCD, content steering) | 111.2 |
| `<hlsjs-video>` define alone | 190.4 |
| **Chunk added to the default player** | **204.0** |

The plan's budget for this chunk is "≤ v4 (162 KB)". hls.js 1.7 alone is above it, and the light build drops the alternate audio that the audio menu needs. The budget is a developer decision (see `log.md`).

Note from S-3: the `v4-controls` entries define the player element after `<media-container>`. That does not change the size, but at run time the player element must be defined first, or the container never registers.
