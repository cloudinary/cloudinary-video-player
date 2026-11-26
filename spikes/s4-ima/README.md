# S-4 — Google IMA ads inside a Video.js 10 player (T007)

## Question

Can v5 run Google IMA ads (`ima3.js`, client side) inside a Video.js 10 player without breaking playback?

1. IMA's own `<video>` must **not** become the player's main media (risk row in `plan.md`).
2. Pre-roll, then content: the ad starts, the content waits, the ad ends, the content plays. Desktop Chromium is run here; iPhone is reasoned about and goes to the device checklist.
3. Record what v4 really does with `adsInPlaylist` and `postrollTimeout` (`research.md` R-04, spikes 1 and 2).

## Method

- **Versions:**
  - `@videojs/html` **10.7.0**. The plan pins 10.3.0, which is not installed here. The discovery code below was read in 10.7.0 only.
  - IMA SDK **3.800.0**, loaded at run time from `imasdk.googleapis.com` (`google.ima.VERSION`).
  - Playwright 1.60, headless: Chromium 148, Firefox 150, WebKit 26.4. "iPhone" is Playwright's `iPhone 13` profile on WebKit (iPhone user agent, touch, mobile viewport). It is **emulation**, not iOS.
  - v4: the published **4.1.6** from jsDelivr, loaded the same way as `docs/vast-vpaid.html`. v4 source read in this repo's `src/` and in `node_modules`: `videojs-ima` (2.5.0 in `package-lock.json`; the cited code is the same in 2.6.0), `videojs-contrib-ads` 7.5.2 and `videojs-per-source-behaviors` 3.0.1.
- **Ads:** Google's public VMAP sample that `docs/vast-vpaid.html` uses (`iu=/124319096/external/ad_rule_samples`, `sample_ar=preonly`): one 10 s linear pre-roll. For the post-roll, C3 uses the same sample with `sample_ar=premidpost` (pre-roll, mid-roll and post-roll cues).
- **Content:** Cloudinary `demo` `sea_turtle.mp4` (15.2 s) for v5, `dog` and `sea_turtle` for v4. Muted, `playsinline`.
- **Files:**
  - `page.js` is the v5 probe. A `createPlayer({ features: videoFeatures })` player holds `<media-container>`, which holds the content `<video>` and the IMA ad container. The `layout` parameter selects where the ad container goes (see C1). The probe logs IMA ad events, content `<video>` events and a store snapshot every 1 s during the ad.
  - `v4.html` is the v4 probe. It logs ad and player events, the effective IMA and contrib-ads settings, and every `ima.playAdBreak()` call.
  - `run.mjs` bundles `page.js` with Rolldown in memory, serves both pages and runs the scenarios. Output goes to `results.json` (raw logs included).
- **Why the pages are on https:** IMA loads its bridge iframe with the page's protocol. On an `http://127.0.0.1` or `http://localhost` page every ad request fails with **AdError 1005**, so no ad plays. `run.mjs` serves the pages through Playwright request routing on a fake origin, `https://s4.spike.test`. No HTTP server is opened.
- **What counts as proof for C1:** `player.store.target.media` (documented in `reference/api/media-capabilities.md`) and the store state `paused`, `duration`, `currentTime` and `currentSrc`, compared with the content `<video>` itself. The probe also logs `player.querySelector('video, audio')`, which is the discovery query.
- **Run** from the repo root: `node spikes/s4-ima/run.mjs [v5|v4]`. `S4_FILTER=<text>` runs only the scenarios whose name contains the text. A run replaces the scenarios with the same name in `results.json`. All scenarios take about 9 minutes. All runs in `results.json` are from 2026-11-26.

## How Video.js 10 finds its media (10.7.0)

- `@videojs/html/dist/dev/player/element.js`, `#syncNativeMedia`: `this.querySelector("video, audio")`. This is the **first** `<video>` or `<audio>` in document order in the player's **light DOM**. A `MutationObserver` (`childList`, `subtree`) runs it again on every DOM change. It does not look into shadow roots.
- `#syncMedia`: a registered media component (`<hlsjs-video>` and others register through context) wins over the native element. The last registration wins.
- The docs say the same: `reference/components/player-container.md` → "Media attachment": plain `<video>` and `<audio>` elements "are tracked automatically, including when they are added, removed, or replaced". No `slot="media"` is needed.
- `new google.ima.AdDisplayContainer(container, contentVideo)` puts **2 `<video>` elements** in the container at once, before any ad is requested (desktop engines). With the iPhone profile it puts 1 (with `disableCustomPlaybackForIOS10Plus: true`) or 0 (default).

So an IMA container in the player's light DOM is a trap. Before the content, it wins at once. After the content, it wins as soon as the content element leaves the DOM, for example during a source or engine change. In a shadow root it is never found.

## Results

| # | Exit criterion | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | IMA's `<video>` is not picked as the main media | **yes**, with the ad container in a shadow root | `cld-ad-layer` (own element, open shadow root, IMA container inside) in `<media-container>`. Chromium, Firefox and WebKit: in all 17–18 snapshots during the ad, `store.target.media` is the content `<video>`, store `duration` is 15.2 (the content), `currentSrc` is the content and `paused` is `true`. When the content `<video>` is removed, the store media is `null`, then the new content `<video>`. The two light-DOM layouts fail (table below). |
| 2a | Pre-roll → content, desktop Chromium | **yes** | Event order below. `contentPauseRequested` → `store.pause()`; content `currentTime` stays 0 for the whole ad; `contentResumeRequested` → `store.play()`; content `playing` 1 ms later and `currentTime` 3.0 at +3 s. `isCustomPlaybackUsed()` is `false`. Firefox (2.9 s) and desktop WebKit (2.9 s) pass too. |
| 2b | Pre-roll → content, iPhone | **not verified here** | A real iPhone is needed. Emulation results and the reasoning are in "iPhone" below, the open items in the checklist. |
| 3a | v4 `adsInPlaylist` recorded | **yes** | It has **no effect** with the default `autoPlayAdBreaks`. The ads are requested once per page. The next playlist item waits 5 s for a pre-roll that never comes, then plays. Details in "C3". |
| 3b | v4 `postrollTimeout` recorded | **yes** | It is **ignored**. The post-roll wait is always contrib-ads `timeout`, 5000 ms. With `postrollTimeout: 1000` and the post-roll ad request held: `adtimeout` 5000 ms after `readyforpostroll`, then one `ended`; the post-roll never plays. Details in "C3". |

### C1: where the ad container goes (Chromium)

| Layout | Store media during the ad | Store `duration` during the ad | Content at +3 s after resume | Content `<video>` removed → store media |
| --- | --- | --- | --- | --- |
| Light DOM, **before** the content (negative control) | IMA `<video>`, from `AdDisplayContainer` creation on | 0, then 10 (the ad) | not playing, `currentTime` 0 | IMA `<video>` |
| Light DOM, **after** the content | content | 15.2 | playing, 3.0 s | IMA `<video>` (store `currentSrc` is the ad file) |
| **Shadow root** (`cld-ad-layer`, host before the content) | content | 15.2 | playing, 3.0 s | `null`, then the new content |

The shadow layout gives the same result in Firefox 150 and WebKit 26.4.

### C2: event order (Chromium, shadow layout)

Times are ms from page start. `store:` lines come from `store.subscribe` and a 50 ms poll of `store.target.media`.

```text
    7  store   paused=true
   55  store   media=content
  716  ima     SDK loaded (3.800.0); AdDisplayContainer, AdsLoader, requestAds
 1755  ima     ADS_MANAGER_LOADED
 1806  ui      click → adDisplayContainer.initialize(), adsManager.init() + start()
 2123  ima     loaded, contentPauseRequested → show the ad layer, store.pause()
 3376  ima     impression, start (10 s linear ad, isCustomPlaybackUsed false)
 6285  ima     firstQuartile      8675 midpoint      11066 thirdQuartile
13588  ima     complete
13591  ima     contentResumeRequested → hide the ad layer, store.play()
13591  store   paused=false
13591  ima     allAdsCompleted
13591  content play            13592 content playing
```

### Key numbers

- Click → `contentPauseRequested`: 317 ms. Click → ad `start`: 1.57 s (Chromium).
- `contentResumeRequested` → content `playing`: 1 ms (Chromium, the content was already buffered).
- During the ad the content `currentTime` stays 0.0 in all three desktop engines.
- IMA `<video>` elements in the container: 2 (desktop), 1 (iPhone profile, `true`), 0 (iPhone profile, default).
- v4, playlist item 2: `adtimeout` 5001–5009 ms after `contentchanged`, content `playing` 5002–5010 ms after it, in all three `adsInPlaylist` runs.
- v4, post-roll with `postrollTimeout: 1000`: `adtimeout` 5000 ms after `readyforpostroll`, `ended` 5001 ms after it.

### iPhone (C2b)

**Correction to the task brief.** The brief says the default `false` keeps IMA out of the content element. The IMA docs say the opposite. `setDisableCustomPlaybackForIOS10Plus`: "When false, ads will play in the same player as your content" and "If true, ads will play inline if the content video is inline … the ad will stay inline and not support iOS's native fullscreen." The default is `false`, and `videojs-ima` passes the flag only if it is set, so v4 runs the default. Skippable (TrueView) ads need `true`.

What this means for v5 media discovery:

- **Default (`false`):** IMA does not create a `<video>`. Discovery is safe, but the **content element plays the ad**. The store reports the ad: `currentSrc` is the ad file, `duration` 10, `paused` `false`, `currentTime` counts up. The v5 event bridge must hide this from the public API (`setAdActive`, R-04), and the UI must not show the ad's time as content time. After the ad, IMA puts the content `src` back (`restoreCustomPlaybackStateOnAdBreakComplete`).
- **`true`:** IMA plays the ad in its own inline `<video>` in the ad container. With the shadow layout the store keeps the content, as on desktop.

Emulation (WebKit 26.4 with the `iPhone 13` profile) shows the iOS code path of IMA. It is not proof for a real iPhone:

| Flag | `isCustomPlaybackUsed()` | IMA `<video>` elements | Store media during the ad | Store during the ad | Content after resume |
| --- | --- | --- | --- | --- | --- |
| default (`false`) | `true` | 0 | content | `currentSrc` = ad file, `duration` 10, `paused` `false`, time 0 → 9.7; the content element fires `ended` when the ad ends | src restored, `playing` 0.6 s after `play`, 2.4 s at +3 s |
| `true` | `false` | 1 | content | content src, `duration` 15.2, `paused` `true` | playing, 3.0 s at +3 s |

In default mode the ad's end fires `ended` on the content element. A first run called `adsLoader.contentComplete()` on that event: IMA then fired `allAdsCompleted` before `complete`, and the content stayed at 0 s after resume. Ignoring `ended` while the ad is active fixed it (the run above). v5 needs the same guard, and the event bridge must not forward that `ended`.

## C3: v4 `adsInPlaylist` and `postrollTimeout`

### Defaults

| Option | `configSchema.json` default | Runtime default | Source |
| --- | --- | --- | --- |
| `adsInPlaylist` | `'first-video'` | not set | The schema is only copied into the build output; no code applies its defaults, and `src/config/defaults.js` has no `ads` key. `src/plugins/ima/index.js` uses `one('sourcechanged')` for `'first-video'` and `on('sourcechanged')` for anything else, so "not set" behaves like `'every-video'`. |
| `prerollTimeout` | 5000 | 5000 (`\|\| 5000`) | `index.js` → `videojs-ima` → contrib-ads: `contribAdsDefaults = { debug, timeout, prerollTimeout }` (`videojs-ima/src/client-side/controller.js`). |
| `postrollTimeout` | 5000 | 5000 (`\|\| 5000`), but **not used** | `index.js` passes it to `videojs-ima`, which does not pass it to contrib-ads (see `contribAdsDefaults`). contrib-ads `Postroll` uses `postrollTimeout` only if it is a number, else `timeout` (5000). |
| `autoPlayAdBreaks` | — | `true` | `index.js`: `ads.autoPlayAdBreaks !== false`. Not in `src/validators/validators.js`. |

Also seen: `index.js` passes `debug: playerOptions.ads.denug` (typo), so `ads.debug` (used in `docs/vast-vpaid.html`) does nothing.

### When v4 requests ads for playlist items

- `videojs-ima` requests the ad tag **once**, when the player is ready (`requestMode: 'onLoad'`, `player-wrapper.js` → `controller.requestAds`). Nothing requests ads again on a source change.
- `adsInPlaylist` only decides how often `player.ima.playAdBreak()` runs on `sourcechanged`. `SdkImpl.playAdBreak` does something only when `autoPlayAdBreaks` is `false` (`sdk-impl.js`), and v4 sets it to `true`. So the call is a **no-op**.
- On the next item, contrib-ads gets `contentchanged` (on `loadstart` with a new source) and goes back to the pre-roll wait. No ad comes, because the one VMAP response was already used.

Measured (v4 4.1.6, Chromium, playlist `dog` → `sea_turtle` with `autoAdvance: false`, `playNext()` called 2 s into the content after the pre-roll). Auto-advance after `ended`, as in the demo, was not run, and only item 2 was measured:

| `adsInPlaylist` | Ad tag requests | `playAdBreak()` calls | Item 1 | Item 2 |
| --- | --- | --- | --- | --- |
| not set | 1 VMAP (+ IMA's fetch of the pre-roll VAST) | 2, both no-op | pre-roll plays | no ad, `adtimeout` after 5009 ms, then content |
| `'every-video'` | same | 2, both no-op | pre-roll plays | no ad, `adtimeout` after 5001 ms, then content |
| `'first-video'` | same | 1, no-op | pre-roll plays | no ad, `adtimeout` after 5008 ms, then content |

So in v4 the effective behavior is "pre-roll on the first item only, plus a 5 s wait on the next item", whatever `adsInPlaylist` says. During the wait the content gets `play` at once but `playing` only after `adtimeout` (what is on screen was not checked). With `autoPlayAdBreaks: false` (not run here), `playAdBreak()` would call `adsManager.start()` on the same ads manager without a new request.

### What happens on post-roll timeout

Run: v4 4.1.6, Chromium, `dog` with the `premidpost` sample, `postrollTimeout: 1000`. The runner holds every `vpos=postroll` request for 20 s, then seeks to the end. The source is set after the ima chunk has started contrib-ads (see the side observation for why).

```text
 1948  play → readyforpreroll; the pre-roll plays (ads-ad-started 4073, adend 14313)
17432  ended (raw tech event) → readyforpostroll     contrib-ads: ContentPlayback → Postroll
18033  IMA requests the post-roll VAST (held by the runner)
22432  adtimeout, 5000 ms after readyforpostroll     contrib-ads: Postroll → AdsDone
22433  ended (the one public ended); no post-roll ad plays
```

- The wait is contrib-ads `timeout` (5000 ms). The effective contrib-ads settings in the run: `timeout` 5000, `prerollTimeout` 5000, `postrollTimeout` not set.
- On timeout, contrib-ads gives up the post-roll and fires `ended` at once. IMA still made one more post-roll request at 23039 ms; no ad played.
- With no post-roll cue (cue points without `-1`), `videojs-ima` triggers `nopostroll` right after `contentComplete()`, so there is no wait (`sdk-impl.js` `onContentComplete`; read in the source, not run here).

### Side observation: `source()` in the same tick can lose all ads in v4

`src/plugins/ima/index.js` starts with `await import('./ima')`, so contrib-ads starts after the async chunk loads. contrib-ads must see the first `loadstart` before `readyforpreroll` can fire (`Preroll.afterLoadStart`). `docs/vast-vpaid.html` calls `player1.source('elephants')` right after `cloudinary.videoPlayer()`.

| `dog`, `premidpost` sample | `loadstart` | contrib-ads ready | Pre-roll | Post-roll check |
| --- | --- | --- | --- | --- |
| `source()` in the same tick | 35 ms | 168 ms | **none**: no `readyforpreroll`, content plays during the 5 s wait, `adtimeout` | **none**: contrib-ads stays in `Preroll` to the end, so no `readyforpostroll` |
| `source()` after the chunk | 162 ms | 152 ms | plays | runs (above) |

The same-tick run logs the contrib-ads error "has not seen a loadstart event 5 seconds after being initialized … initialized too late". This is a race (a cached chunk can win it), but the demo pattern lost it here. The playlist runs won the same race by only 5–25 ms (contrib-ads ready at 109–128 ms, first `loadstart` at 133–139 ms).

## Code sketch for v5

The IMA container lives in a shadow root, so media discovery (a light-DOM `querySelector('video, audio')`) never sees IMA's `<video>` elements. The hooks are the R-04 ad hooks.

```js
customElements.define('cld-ad-layer', class extends HTMLElement {
  constructor() {
    super(); this.hidden = true;
    this.attachShadow({ mode: 'open' }).innerHTML = '<style>:host{position:absolute;inset:0;z-index:2}'
      + ':host([hidden]){display:none}div{width:100%;height:100%}</style><div></div>';
  }
  get container() { return this.shadowRoot.querySelector('div'); }
});

export function startImaAds({ player, mediaContainer, adTagUrl, ads /* onPlayRequest, setAdActive */ }) {
  const { ima } = window.google;
  const layer = mediaContainer.appendChild(document.createElement('cld-ad-layer')); // fullscreen keeps the ad
  const content = player.store.target.media; // documented (media-capabilities.md); recreate on a media change
  const display = new ima.AdDisplayContainer(layer.container, content);
  const loader = new ima.AdsLoader(display);
  const adBreak = (on) => { layer.hidden = !on; ads.setAdActive(on); on ? player.store.pause() : player.store.play(); };
  let manager;
  loader.addEventListener(ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, (event) => {
    manager = event.getAdsManager(content, Object.assign(new ima.AdsRenderingSettings(), { restoreCustomPlaybackStateOnAdBreakComplete: true }));
    manager.addEventListener(ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => adBreak(true));
    manager.addEventListener(ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => adBreak(false));
  });
  content.addEventListener('ended', () => layer.hidden && loader.contentComplete()); // iOS: the ad ends in `content` too
  loader.requestAds(Object.assign(new ima.AdsRequest(), { adTagUrl }));
  ads.onPlayRequest(() => { // synchronous, inside the user gesture
    display.initialize();
    manager.init(layer.clientWidth, layer.clientHeight, ima.ViewMode.NORMAL); // if loaded; else on load, within the R-04 timeout
    manager.start();
  });
}
```

`store.target.media` was tested only with a native `<video>`. With `<hlsjs-video>` or `<dash-video>`, the target is the media component, not a plain `<video>` (not verified here; see the open questions).

Not shown: ad errors and the pre-roll timeout (resume content once, idempotent), `holdEnded` for post-rolls, `adsManager.resize()` from a `ResizeObserver`, and destroy on source change.

## Device / floor checklist

Run each item on the real device with the `cld-ad-layer` layout and the VMAP pre-roll tag.

- [ ] **iPhone, Safari, flag default (`false`):** the ad plays in the content `<video>`. Check that the content plays from the right time after the ad, that the store and the public events do not leak the ad's `src`, time and `ended`, and native fullscreen during the ad.
- [ ] **iPhone, flag `true`:** the ad plays inline in IMA's `<video>`; the store keeps the content. Check inline playback, that skippable ads show the skip button, and that native fullscreen of the content is not offered during the ad.
- [ ] **iPhone with HLS through hls.js:** on iOS 17.1+, hls.js 1.7 prefers `ManagedMediaSource`, and the `<hlsjs-video>` adapter uses MSE when `Hls.isSupported()`. With the default flag, IMA sets the content element's `src` to the ad file, which detaches hls.js. Check whether the content comes back, or force native HLS during ads, or use `true`.
- [ ] **iPad (desktop user agent):** check which IMA path runs (custom playback or not).
- [ ] **Android Chrome:** muted autoplay, `initialize()` in the first tap, ad tap-through and resume.
- [ ] **Desktop fullscreen:** `<media-container>` fullscreen keeps the ad layer on top; `adsManager.resize()` on enter and exit.
- [ ] **Ad blocker:** `ima3.js` blocked or the request fails → content plays at once.
- [ ] **Ad UI in the shadow root:** click-through opens the advertiser page, the skip button works, IMA's viewability measurement counts the ad as visible. This spike checked playback and events only.
- [ ] **Keyboard and gestures during the ad:** `<media-hotkey>` and `<media-gesture>` act on the store, which is the content (or, on iPhone default, the ad in the content element). Check that space, arrows and taps do not seek or resume the content during the ad.
- [ ] **Floor browsers:** custom elements and open shadow roots are needed (Safari 10.1+, all current engines). The ad layer adds no other requirement.

## Open questions for the developer

1. **iOS mode:** v4 runs IMA's default (`false`, ad in the content element). Keep that for parity, or use `true` (content element untouched, skippable ads, no native fullscreen for the ad)? The hls.js item in the checklist can decide it.
2. **`adsInPlaylist` parity:** v4 plays the pre-roll on the first item only and makes the next item wait 5 s, for any value. R-04 plans a new request per item for `'every-video'`. That is new behavior, not parity. Which one ships, and does the 5 s wait go away?
3. **`postrollTimeout`:** v4 ignores it (always 5000 ms). Honor it in v5 (a fix), or keep 5 s?
4. **Late start:** the v5 ads module must work when it loads after the source is set (v4 can lose all its ads then). R-04's own state machine and `onPlayRequest` gate do not need the first `loadstart`. Add a test for "source set before the ads chunk loads".
5. **Hotkeys and gestures during ads:** block them, or map play/pause to `adsManager.pause()` / `resume()`?
6. **Local development needs https** for ads (AdError 1005 on http). The dev server and the e2e harness must serve https, or route as `run.mjs` does.
7. **Which element IMA gets with streaming media:** with `<hlsjs-video>` or `<dash-video>`, `store.target.media` is the component. Does IMA accept it as the content video, or must v5 pass the inner `<video>`? Not verified here.
8. **Version:** checked on 10.7.0 only. If v5 stays on 10.3.0, run this spike again there.
