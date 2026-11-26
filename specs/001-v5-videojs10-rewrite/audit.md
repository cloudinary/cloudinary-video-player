# Cloudinary Video Player v4.1.3 — rewrite audit (2026-10-14)

Sources: 4 research/audit agents + direct reads. "Verified" = checked by direct read. Others = agent findings, not re-verified.

## A. Video.js 10 facts (primary sources: videojs.org docs/changelog, npm, GitHub)
- Stable: 10.0.0 GA 2026-10-01; latest 10.1.0 (2026-10-12). Repo moved to videojs/video.js; v8 at videojs/videojs-v8, security fixes only (README: until 2028-10-01; roadmap: "security patches only" from 2027).
- Packages: @videojs/html (also for Vue/Svelte), @videojs/react, core, store, element, media, utils, spf, cdn, cli. Adapters: hlsjs-video (hls.js 1.6.19), native-hls-video, dash-video (dash.js 5.2, no DRM), shaka-video (DRM), mux/youtube/vimeo/etc. Extensions: google-cast, mux-data. Icons in @videojs/html/icons.
- npm `video.js@10.1.0` is a shim that throws VJS8_LEGACY_* on videojs()/registerPlugin/etc. Registry dist-tag `latest` = 10.1.0 on 2026-10-14 even though docs say `next`. This repo pins ^8.23.4 (safe).
- Architecture: state (store in player element) / UI (skins or components) / media (replaces techs) / extensions. HTML custom elements `<video-player><video-skin><video>`. `createPlayer({ features })`. No `videojs(el, opts)`. Imperative control via `player.store.play()/seek()/requestFullscreen()` once store.target is set.
- No registerPlugin/registerComponent by design. "Features" = store slices (playbackFeature, qualityFeature, textTrackFeature...), presets video/audio/live-video/live-audio/background. `definePlayerFeature` and `PlayerExtension` exist in @videojs/core/dom but are `@internal`/undocumented. Only custom UI components (UIElement + PlayerController) have a public guide.
- SPF `<hls-video>`: tiny HLS engine, fMP4/CMAF only, no TS/ADTS/AES-128/ads/LL-live.
- ABR API: videoRenditionList, activeVideoRendition, selectVideoRendition(id|"auto").
- Built in: captions (native track, ::cue, menu), chapters as time-slider segments (+HLS JSON chapters), VTT storyboard thumbnails, PiP, fullscreen, hotkeys/gestures, AirPlay, Cast, i18n, title, error dialog, live/DVR.
- Not built in: textTrackSettings dialog, chapter menu/active chapter, cue points, playlists, ads/IMA, full-window fullscreen fallback, Media Session, saved prefs, custom playbackRates, configurable inactivity timeout. Context menu: not found (unverified absence).
- Skins: Default, Neutral, Compat (Safari 16), Scaffold. Public CSS vars (8): --media-accent-color, --media-accent-text-color, --media-border-color, --media-border-radius, --media-font-family, --media-object-fit, --media-object-position, --media-scale-unit. Layout changes require ejecting skin via Shadcn registry. No runtime theme switching.
- No v8 compat layer; v8 plugins do not work.
- Size: beta post v10 HTML 25.1 kB gz vs v8 core 75.2 kB; v10+SPF 38.7 kB; v10+hls.js 164.1 kB; v8+VHS 202.7 kB.
- Browsers: Chrome/Edge 111+, Firefox 121+, Safari/iOS 16.4+. Needs :has(), @container, @layer, ES2022. Smart TVs / WebViews not supported targets. React 18/19 peer.
- Roadmap (no dates): ads, analytics, plugin ecosystem migration, lightweight ABR, MoQ.

## B. Cloudinary streaming probe (verified, demo account)
- `sp_auto/dog.m3u8`: HLS v7, fMP4 with EXT-X-MAP + byte-range, muxed audio+video (CODECS avc1+mp4a in one variant). DASH `.mpd` also fMP4 (`.mp4dv`). => SPF may work for VOD; muxed-track support in SPF unverified. Live/TS/AES/DRM not probed.

## C. Distribution & contracts
- UMD (webpack): `player` (lazy shell, import()s cld-player-core) and `player-full` (sync). Both set window.cloudinary. Named lazy chunks = public CDN filenames (adaptive-streaming, dash, ima, chapters, colors, playlist, share, shoppable, interaction-areas, recommendations-overlay, debug, cld-poster-url). min + non-min builds.
- Extra: cld-video-player(.min).js = player-full; cld-video-player.light(.min).js = full + console.warn; schema.json copy.
- ESM (rollup -> lib/): index, index.full, all, dash, debug. Unminified. lib/_videojs-proxy.js (1 MB) sets window.videojs. CSS copied from dist (build-es depends on build).
- Exports map: `.`, ./full, ./all (import vs require differ), ./videoPlayer (import=lazy, require=full), ./player (dup), CSS x2, `./*`->lib/* (exposes every rollup chunk), ./light/*.
- bundlewatch: player.min.js 10kb, player-full.min.js 140kb (last local build 139.5 KB gz). lib/ not watched (AGENTS.md wrong).
- jsDelivr purge covers every dist file => every dist filename is a public URL.
- Types (types/cld-video-player.d.ts): options all `any`; declares nonexistent `videoPlayerWithProfile`; types videoPlayer as sync though `.` returns a thenable Proxy; one d.ts for `.` and ./full.
- configSchema.json: 59 props, additionalProperties true; drifted from defaults.js; omits profile, cloudinaryConfig, publicId, poster, ima, qualitySelector, recommendations, rawTransformation, source, info, type, fetchErrorUsingGet.

## D. Options & API (src)
- Cloudinary config accepted 3 ways (top-level snake, top-level camel converted, cloudinaryConfig object needing snake).
- PLAYER_PARAMS never read: ima, qualitySelector, player-level queryParams.
- videojs namespace spelled `videojs` in utils but `videoJS` in schema/validators/analytics.
- muted forces volume(0.4). maxTries/videoTimeout read from videojs.options_.
- Data attributes: every attribute parsed (incl. class/id); "0"/"false" stay strings.
- Aliases: resourceType->resource_type; rawTransformation only for codec check while raw_transformation reaches URL; info() returns description as subtitle and description.
- Public API: ~40 chainable getter/setters on VideoPlayer + on/one/off/trigger; `videojs`, mutable `options`, retry helpers effectively public.
- Chaining broken: chainTarget placed in cloudinaryConfig, plugin reads top-level => source() etc. return the vjs player, not VideoPlayer.
- volume(0)/width(0)/height(0) act as getters.
- VERIFIED: playNext()/playPrevious() recurse forever if playlist plugin not yet loaded (video-player.js playlist() returns `this` when player.cloudinary.playlist unset; set lazily in plugins/playlist/index.js:6).
- VERIFIED: last source's transformation becomes default for next source (plugins/cloudinary/index.js:119 sets _transformation; :174 merges this.transformation() into next).
- 4 return shapes: VideoPlayer, Proxy (deferred), Promise<VideoPlayer>, Promise<stub> (lazy/schedule). Stubs silently drop source(). Deferred proxy getters return the proxy; `has` trap always true.

## E. Source pipeline
- source() -> normalize -> merge inherited sourceOptions -> retry timers -> CloudinaryContext.source -> buildSource: breakpoints (RENDITIONS >= clientWidth*DPR + c_limit), aspectRatio/cropMode (ar_, c_, g_auto, b_), merge config/tx/sourceTypes, poster width rounded to 100*DPR, _s=vp query param, AudioSource if 'audio' else VideoSource.
- VideoSource.generateSources per sourceType: codecs (vc_), auto -> f_auto:video (video/auto mime + HEAD middleware), hls/dash -> sp_auto unless set/live, hdr -> f_mp4,vc_h265,dr_high, raw URL -> one source by extension.
- Poster: applet URL `/_applet_/.../poster?tx=` (tx unencoded) or ImageSource jpg; audio fl_waveform. Poster logic in 5 places.
- refresh: codec filter via canPlayType/MediaSource.isTypeSupported -> player.src(); hls/dash lazy import; isHls uses endsWith('.m3u8') (fails with query string).
- cldsourcechanged drives seek thumbs VTT, AI highlights, chapters, text tracks, share, source switcher (6 handlers in video-player.js).
- Error path: handleCldError probes URLs, maps x-cld-error header; mutates module constants; sends Content-Range as request header; res.status on array (agent finding).
- url-gen: only backwards/* shims (createCloudinaryLegacyURL, legacy Transformation). Modern builder unused. Other URLs hand-built.
- BaseSource leftover options bag merged into URL options (raw_transformation works by accident; any matching key leaks into URL).
- extendCloudinaryConfig = Object.assign onto shared config (per-source config mutates player-wide).
- profile-url-pattern URL_PATTERN unanchored.
- constructor.name checks break under minification.

## F. Loading model
- player(): fetchAndMergeConfig (built-in profiles cld-default/looping/adaptive-stream/live-streaming; named profile /_applet_/video_service/video_player_profiles/{name}.json; raw profile URL; else default per-publicId video_player_config/.../{b64}.json) -> schedule check -> lazy check -> create.
- Schedule: outside window renders poster placeholder, never activates when window opens.
- Lazy: placeholder + big-play; click or IntersectionObserver.
- index.js vs index.full.js near-duplicates.

## G. Plugins & components inventory
| Feature | Enabler | Load | Deps | ~LOC | Notes |
|---|---|---|---|---|---|
| adaptive-streaming | hls/dash sourceTypes, .m3u8/.mpd | lazy | hls.js, vendored Peer5 contrib-hlsjs tech, contrib-quality-levels/menu, contrib-dash | 715 | private tech API; listeners re-added each loadstart; config fixed by first source; needs window.videojs |
| ai-highlights-graph | aiHighlightsGraph (false) | eager | – | 169 | copy of vtt-thumbnails scaffolding; hardcoded colour |
| analytics (GA) | analytics | eager | gtag | 219 | Ended fires once per lifetime; coupled to shoppable |
| autoplay-on-scroll | autoplayMode:'on-scroll' | eager | – | 85 | unthrottled scroll, no IO |
| cloudinary-analytics | cloudinaryAnalytics (default true) | eager | cloudinary-video-analytics | 88 | side channel player.videoElement |
| chapters | source chapters, chaptersButton | lazy | – | 235 | monkey-patches tooltips |
| colors | colors | lazy | – | 64+195 scss | chunk for 3 setProperty calls |
| context-menu | !hideContextMenu | eager | vendored videojs-contextmenu | 460 | duplicates control bar |
| floating-player | floatingWhenNotVisible | eager | – | 156 | wraps host DOM; coupled to IMA |
| ima | ads | lazy | contrib-ads, videojs-ima, IMA SDK | 51 | called directly; uses sourcechanged |
| interaction-areas | interactionDisplay + source interactionAreas | lazy | themedButton, localStorage | 515 | first source only; hardcoded res.cloudinary.com/prod URLs; IE11 code; not keyboard accessible |
| playlist (+widget, upcoming overlay, next/prev) | playlist()/playlistByTag(), playlistWidget | lazy | – | 1.2k+350 scss | calls nonexistent disposePlaylist/sourcesByTag; many small bugs |
| share (download only) | source download | lazy | – | 200 | misnamed; 423 polling; spinner can hang |
| shoppable | source shoppable | lazy | – | 1.0k+364 scss | new widget per source(), leaks listeners; window.open w/o noopener |
| source-switcher | videoSources | eager | – | 180 | – |
| styled-text-tracks | textTracks.options | eager | webfontloader | 98+63 | appends <style> per call; user CSS via innerHTML |
| text-tracks-manager | source textTracks | eager (labelled lazy) | srt-parser-2 | 410 | VTT/SRT/transcripts (202 polling), word highlight; removes all remote tracks incl. chapters |
| vtt-thumbnails | seekThumbnails (default true) | eager | – | 277 | fork; module-global cache; monkey-patch |
| per-source-behaviors | always | eager | videojs-per-source-behaviors | – | only for sourcechanged event |
| Components | TitleBar (shadows vjs8 TitleBar), CldErrorDisplay (innerHTML isHtml), Jump buttons (dup of skipButtons), LogoButton (unsanitised url), BigPauseButton (mobile), ProgressControlEventsBlocker, themeButton, recommendations-overlay (lazy, TODO use ModalDialog; misspelled aria-labels) |

Cross-cutting: 3 lazy wrapper shapes; isFunction init-vs-update pattern races; global prototype mutation of Player/ControlBar children at import; shared state hung on player (`player.cloudinary.*`, adaptiveStreamingLoaded, videoElement, postModal); ~30 string events; two source events (cldsourcechanged + sourcechanged); no plugin dispose paths; Node EventEmitter layered on vjs events; setupEventMethods keys handlers by function source text; EventHandlerRegistry.removeAllListeners no-op; `playerload` emitted before listeners subscribe.

Styling: main.scss imports video-js.min.css + 72 .vjs- overrides; prefixes cld-, cld-plw-, cld-spbl-, vp-ia-, vp-theme-button; two theming systems (CSS vars --color-base/accent/text + skin classes/utility classes); focus outline replaced by text-shadow; icon font inline base64 reusing "VideoJS" family; Google "Inter" via webfontloader by default; CSS all eager (splitChunks.styles).

## H. Analytics/privacy/security
- 3 analytics pipelines: cloudinaryAnalytics (default on), internal `_sendInternalAnalytics` per source change (to analytics-api-s.cloudinary.com, gated by sourceOptions.allowUsageReport), optional GA.
- Google Fonts request by default.
- api_secret / sign_url / auth_token accepted client-side; signing disabled in shim => unsigned URLs, invites secrets in page source.
- Raw-URL profile pulls arbitrary JSON merged into options (ad tag, logo URL). Per-publicId config merged silently by default.
- utf8ToBase64 not URL-safe; profile name not encodeURIComponent'd; applet tx unencoded.

## I. Tests
- Unit (Vitest, jsdom): 15 files, ~141 cases. Portable: videoSource (64), schedule, breakpoints, poster-url, querystring, cloudinary-config-from-options, text-tracks utils, deferred-player (14), lazy-bootstrap/placeholder. Coupled: source-fallback, extended_events, cloudinaryConfig, legacy-cloudinary-new, contrib-hlsjs-texttracks.
- Old jest/puppeteer (test/*.test.js): 16 files/59 cases, not run in CI, dead. Port test/isValidConfig.test.js (19 validator cases).
- E2E Playwright (Chrome only): 74 tests (~150 runtime); mostly smoke (video.paused); 61 selectors on `<id>_html5_api`; source-switcher spec empty TODO; adaptive console test skipped.

## J. Demos (feature list) — docs/index.html, 41 pages
Playback/formats: adaptive-streaming, live-streaming, raw-url, transformations, aspect-ratio-crop, hdr, codec-formats, audio, 360, breakpoints. Captions: subtitles-and-captions, force-hls-subtitles-ios. Playlists: playlist, playlist-by-tag-captions, recommendations. Monetization: vast-vpaid, shoppable, interaction-area. Analytics: analytics, cloudinary-analytics. UI: colors, components, ui-config, poster, seek-thumbs, chapters, highlights-graph, floating-player, fluid, share-plugin, source-switcher, video-details. Loading: lazy-player, schedule, profiles, autoplay-on-scroll, multiple-players, embedded-iframe. API: api, custom-cld-errors, debug.
- 360 demo exists but `activePlugins_.vr` plugin is not in repo.

## K. CHANGELOG themes (Nov 2024 – Oct 2026)
Captions (top), withCredentials/private media, URL generation (f_auto AV1, dpr, raw URLs), errors/fallback, profile/config merge order (5 releases), poster defaults churn, internal analytics (7+ fixes), a11y, release tooling. Packaging changed in 3 majors (2.0, 3.0, 4.0).

## L. CI / process
- validate.yml: build-all + bundlewatch + unit. No lint, no types. `npm run lint` is broken (ESLint 9 with legacy .eslintrc.js).
- e2e_pr.yml; release.yml (release/edge PR flow, edge prereleases, npm provenance, jsDelivr purge, Slack); deprecate.yml.
- AGENTS.md: "no TypeScript in src", "minimize diffs", "ask first: deps, webpack, exports, major refactors" — conflict with a rewrite.
- .specify constitution = empty template; .specify/.sherpa/.claude untracked. .sherpa FLOW: Jira VIDEO ticket -> plan -> spec -> implement -> test -> docs -> PR.
- Working tree has unrelated uncommitted changes: video-source.js, utils/cloudinary.js, test/unit/videoSource.test.js. Do not touch.
