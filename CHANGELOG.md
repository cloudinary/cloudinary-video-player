# Changelog


## [2.3.0](https://github.com/cloudinary/cloudinary-video-player/compare/v2.2.0...v2.3.0) (2025-01-07)


### Features

* support srt subtitle format ([#743](https://github.com/cloudinary/cloudinary-video-player/issues/743)) ([e0e803e](https://github.com/cloudinary/cloudinary-video-player/commit/e0e803e22442b6f69386691dd750b7be09ffd36b))

## [2.2.0](https://github.com/cloudinary/cloudinary-video-player/compare/v2.1.2...v2.2.0) (2024-12-09)


### Features

* allow fetching transcript from url ([#737](https://github.com/cloudinary/cloudinary-video-player/issues/737)) ([62b2f52](https://github.com/cloudinary/cloudinary-video-player/commit/62b2f5279c748fc654c8d2087b6fa5655d58e6a7))
* auto-fetch transcripts from language ([#741](https://github.com/cloudinary/cloudinary-video-player/issues/741)) ([62b2f52](https://github.com/cloudinary/cloudinary-video-player/commit/62b2f5279c748fc654c8d2087b6fa5655d58e6a7))
* support srt subtitle format ([#743](https://github.com/cloudinary/cloudinary-video-player/issues/743)) ([4b69cc0](https://github.com/cloudinary/cloudinary-video-player/commit/4b69cc072becbcc1ee9de0200997846dad8e82ca))
* support srt subtitle format ([#743](https://github.com/cloudinary/cloudinary-video-player/issues/743)) ([62b2f52](https://github.com/cloudinary/cloudinary-video-player/commit/62b2f5279c748fc654c8d2087b6fa5655d58e6a7))
* support srt subtitle format ([#743](https://github.com/cloudinary/cloudinary-video-player/issues/743)) ([a0a2598](https://github.com/cloudinary/cloudinary-video-player/commit/a0a2598b81c12621663c18c73aa18acc7ae93e0e))


### Bug Fixes

* programatic text-tracks in Safari ([#747](https://github.com/cloudinary/cloudinary-video-player/issues/747)) ([62b2f52](https://github.com/cloudinary/cloudinary-video-player/commit/62b2f5279c748fc654c8d2087b6fa5655d58e6a7))
* videojs 8 deprecation warning for videojs.bind ([#744](https://github.com/cloudinary/cloudinary-video-player/issues/744)) ([62b2f52](https://github.com/cloudinary/cloudinary-video-player/commit/62b2f5279c748fc654c8d2087b6fa5655d58e6a7))

## [2.1.1](https://github.com/cloudinary/cloudinary-video-player/compare/v2.1.0...v2.1.1) (2024-11-05)

### Features

* add internal analytics about new method & profiles ([#699](https://github.com/cloudinary/cloudinary-video-player/issues/699)) ([a1c8c1e](https://github.com/cloudinary/cloudinary-video-player/commit/a1c8c1eb4ffd8362ce4cc7ab5ed47276cc5651ee))
* add url template for video player profiles ([#696](https://github.com/cloudinary/cloudinary-video-player/issues/696)) ([d60cb4f](https://github.com/cloudinary/cloudinary-video-player/commit/d60cb4f4fc9d8b0ff2a6f0e21621c6c84063c898))

### Bug Fixes

* use cld player profiles package for default profiles ([#701](https://github.com/cloudinary/cloudinary-video-player/issues/701)) ([1083b94](https://github.com/cloudinary/cloudinary-video-player/commit/1083b94ac96f4e075d8d820a894703eb644bec7a))

## [2.1.0](https://github.com/cloudinary/cloudinary-video-player/compare/v2.0.5...v2.1.0) (2024-08-21)


### Features

* custom data video analytics param ([2aba293](https://github.com/cloudinary/cloudinary-video-player/commit/2aba293436035f2fedfcb51c3063913f1261d564))
* new 'player' method with support async loading & profiles ([2aba293](https://github.com/cloudinary/cloudinary-video-player/commit/2aba293436035f2fedfcb51c3063913f1261d564))


### Bug Fixes

* update dependencies ([#688](https://github.com/cloudinary/cloudinary-video-player/issues/688)) ([2aba293](https://github.com/cloudinary/cloudinary-video-player/commit/2aba293436035f2fedfcb51c3063913f1261d564))

## [2.0.5](https://github.com/cloudinary/cloudinary-video-player/compare/v2.0.4...v2.0.5) (2024-07-15)


### Bug Fixes

* chapters innerHTML to innerText ([#671](https://github.com/cloudinary/cloudinary-video-player/issues/671)) ([d9b6251](https://github.com/cloudinary/cloudinary-video-player/commit/d9b62513c7abe9eba3458c5193f178ebc6250543))
* custom profile docs example ([#673](https://github.com/cloudinary/cloudinary-video-player/issues/673)) ([d9b6251](https://github.com/cloudinary/cloudinary-video-player/commit/d9b62513c7abe9eba3458c5193f178ebc6250543))
* remove IE polyfill ([#665](https://github.com/cloudinary/cloudinary-video-player/issues/665)) ([d9b6251](https://github.com/cloudinary/cloudinary-video-player/commit/d9b62513c7abe9eba3458c5193f178ebc6250543))
* use videojs events & re-trigger to analytics package with custom… ([#639](https://github.com/cloudinary/cloudinary-video-player/issues/639)) ([d9b6251](https://github.com/cloudinary/cloudinary-video-player/commit/d9b62513c7abe9eba3458c5193f178ebc6250543))

## [2.0.4](https://github.com/cloudinary/cloudinary-video-player/compare/v2.0.3...v2.0.4) (2024-06-17)


### Bug Fixes

* use videojs events & re-trigger to analytics package with custom events ([ac69bbb](https://github.com/cloudinary/cloudinary-video-player/commit/ac69bbb37bbb28b432d57648f4c4774b1d5e8029))

## [2.0.3](https://github.com/cloudinary/cloudinary-video-player/compare/v2.0.2...v2.0.3) (2024-06-10)


### Bug Fixes

* bump video analytics, trigger analytics event only once ([#637](https://github.com/cloudinary/cloudinary-video-player/issues/637))
* handle live streams ([#641](https://github.com/cloudinary/cloudinary-video-player/issues/641))
* prevent undefined error when seek-thumbnails are unavailable ([#635](https://github.com/cloudinary/cloudinary-video-player/issues/635))
* text track with no src should fall-back to transcript ([#640](https://github.com/cloudinary/cloudinary-video-player/issues/640))

## [2.0.2](https://github.com/cloudinary/cloudinary-video-player/compare/v2.0.1...v2.0.2) (2024-05-09)


### Bug Fixes

* ESM chunk styles ([#629](https://github.com/cloudinary/cloudinary-video-player/issues/629)) ([323492f](https://github.com/cloudinary/cloudinary-video-player/commit/323492fbcf6f0e62f40f49fbb7790794e775b98a))
* webpack chunk loading global ([#625](https://github.com/cloudinary/cloudinary-video-player/issues/625)) ([323492f](https://github.com/cloudinary/cloudinary-video-player/commit/323492fbcf6f0e62f40f49fbb7790794e775b98a))

## [2.0.1](https://github.com/cloudinary/cloudinary-video-player/compare/v2.0.0...v2.0.1) (2024-04-16)


### Bug Fixes

* undeprecate Cloudinary.new() (ONCALL-3380) ([#619](https://github.com/cloudinary/cloudinary-video-player/issues/619)) ([174ee48](https://github.com/cloudinary/cloudinary-video-player/commit/174ee4894b5f9395f4d20f048869784bda8f2197))

## [2.0.0](https://github.com/cloudinary/cloudinary-video-player/compare/v1.11.1...v2.0.0) (2024-04-14)

### ⚠ BREAKING CHANGES

* player core is the default ES export

### Bug Fixes

* esm example pages (ME-16168) ([#613](https://github.com/cloudinary/cloudinary-video-player/issues/613)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* withCredentials (ME-16117) ([#607](https://github.com/cloudinary/cloudinary-video-player/issues/607)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))


### Performance Improvements

* cleanup codec logic ([#590](https://github.com/cloudinary/cloudinary-video-player/issues/590)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* debug mode & lazy validators (ME-15925) ([#606](https://github.com/cloudinary/cloudinary-video-player/issues/606)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* default export to be base videoPlayer ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* update dependencies ([#594](https://github.com/cloudinary/cloudinary-video-player/issues/594)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* utils refactor & cleanup ([#595](https://github.com/cloudinary/cloudinary-video-player/issues/595)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))


## [1.11.1](https://github.com/cloudinary/cloudinary-video-player/compare/v1.11.0...v1.11.1) (2024-03-19)

### Bug Fixes

* styled subtitles browser compatibility ([#576](https://github.com/cloudinary/cloudinary-video-player/issues/576)) ([efbee25](https://github.com/cloudinary/cloudinary-video-player/commit/efbee2593b00e34e5dac883593ab2f4ff56e1b28))

## [1.11.0](https://github.com/cloudinary/cloudinary-video-player/compare/v1.10.6...v1.11.0) (2024-03-17)


### Features

* kareoke style subtitles ([#563](https://github.com/cloudinary/cloudinary-video-player/issues/563)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))


### Bug Fixes

* allowUsageReport ([#569](https://github.com/cloudinary/cloudinary-video-player/issues/569)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))
* av1 support ([#557](https://github.com/cloudinary/cloudinary-video-player/issues/557)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))
* mimetypes ([#572](https://github.com/cloudinary/cloudinary-video-player/issues/572)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))
* poster image for raw URLs ([#573](https://github.com/cloudinary/cloudinary-video-player/issues/573)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))
* types definitions ([#565](https://github.com/cloudinary/cloudinary-video-player/issues/565)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))

## [1.10.6](https://github.com/cloudinary/cloudinary-video-player/compare/1.10.5...v1.10.6) (2024-02-13)

### Bug Fixes

* playlist by tag ([#550](https://github.com/cloudinary/cloudinary-video-player/issues/550)) ([519e737](https://github.com/cloudinary/cloudinary-video-player/commit/519e737409b6e546fabc737524ad3576a9595155))
* Improved example pages with Netlify previews ([24763da](https://github.com/cloudinary/cloudinary-video-player/commit/24763dac23bbab337723412897394b2c85fcc281))
* video profiles ([#539](https://github.com/cloudinary/cloudinary-video-player/issues/539)) ([0e99c27](https://github.com/cloudinary/cloudinary-video-player/commit/0e99c27d41ed3d6667d939f6f75fedb3f04e4faf))
* allow Dash ABR on Safari ([#532](https://github.com/cloudinary/cloudinary-video-player/issues/532)) ([cbf80f4](https://github.com/cloudinary/cloudinary-video-player/commit/cbf80f40f106ec3776a10861fb0e062151407491))
* chapters in Safari ([#531](https://github.com/cloudinary/cloudinary-video-player/issues/531)) ([3d77f27](https://github.com/cloudinary/cloudinary-video-player/commit/3d77f27b9bbba8fccd73058be1afeb59455e4039))
* raw URLs from CORs restricted origin ([3b1baed](https://github.com/cloudinary/cloudinary-video-player/commit/3b1baed537172848bbd47cc05cf27655970e5da5))
* picture in picture toggle ([#522](https://github.com/cloudinary/cloudinary-video-player/issues/522)) ([8c271cc](https://github.com/cloudinary/cloudinary-video-player/commit/8c271cc276ca0c79a87d9c845417311923148d98))
* handle styled textTracks usage monitoring ([bcf3cd0](https://github.com/cloudinary/cloudinary-video-player/commit/bcf3cd0d1de61fd6a03cc53c93a38bdabf0016b2))

### Performance Improvements

* Bump VideoJS to 8.10.0 ([3a9fb8](https://github.com/cloudinary/cloudinary-video-player/commit/3a9fb87902c8855a10ec9b1cf7aa672c38dce96d))
* lazy load chapters plugin ([#536](https://github.com/cloudinary/cloudinary-video-player/issues/536)) ([225029b](https://github.com/cloudinary/cloudinary-video-player/commit/225029b9c4d6058d69aaca0d69f40de6e6f2e03e))
* lazy load ads plugin ([#535](https://github.com/cloudinary/cloudinary-video-player/issues/535)) ([981804d](https://github.com/cloudinary/cloudinary-video-player/commit/981804dae2d8939f3edef3fa512ce8398edfc8d2))
* lazy load interaction-areas plugin ([03ec928](https://github.com/cloudinary/cloudinary-video-player/commit/03ec9289633acfece815e912d6f0753754786e0d))
* lazy load shoppable plugin ([#519](https://github.com/cloudinary/cloudinary-video-player/pull/519))
* lazy loaded recommendation component ([cde7922](https://github.com/cloudinary/cloudinary-video-player/commit/cde7922e37694ab944912abbf3c2f0ef1e8ff8f6))
* lazy-loaded playlists ([9f89ab3](https://github.com/cloudinary/cloudinary-video-player/commit/9f89ab336420ed470646ff009ff3a1631c6578c8))

## [1.10.5](https://github.com/cloudinary/cloudinary-video-player/compare/1.10.4...v1.10.5) (2024-01-03)

### Bug Fixes

* GA deploy workflows ([#507](https://github.com/cloudinary/cloudinary-video-player/issues/507)) ([5f2dd5a](https://github.com/cloudinary/cloudinary-video-player/commit/5f2dd5ae3b320e0350adf8f6c0c38be92ac16839))


## 1.10.4 / 2023-12-19

* feat: styled text tracks (subtitles & captions)
* fix: caching of auto chapters VTT files


1.10.3 / 2023-12-17
==================

* fix: styled-subtitles to use x/y box


1.10.2 / 2023-11-05
==================

* fix: ES build default export
* Scrollable subtitles - popup menus
* feat: f_auto by default


1.10.1 / 2023-10-24
==================

- Update cld analytics package


1.10.0 / 2023-10-18
==================

* feat: Chapters plugin
* fix cld analytics to be called on cld video event changed


1.9.18 / 2023-10-08
==================

fix: custom logo
fix: yarn to npm


1.9.17 / 2023-10-05
==================

- fix: duplicate requests for video summarization and thumbnails info
- fix: init event -> source change event
- feat: Light theme logo changed from blue to black
- chore: Update VideoJS to 8.5.2
- feat: Update cloudinary video analytics package & send custom props about video player type
- refactor: ai-highlights-graph filename
- Replace `yarn` with `npm`


1.9.16 / 2023-09-12
==================

* Video player face-lift - redesigned themes, icons, volume-bar.


1.9.15 / 2023-08-30
==================

* Support camelCase cloud config (i.e. cloudName)
* Use cloudinary-video-analytics
* Collect video player usage


1.9.14 / 2023-08-16
==================

* fix: poster image black-bars
* Add AI highlights graph (histogram) plugin


1.9.13 / 2023-08-13
==================

* Upgrade VideoJS to v8
* Update videojs-vr
* Fix: seek-thumbnails error with raw-urls
* Fix: components example page post videojs `extend` deprecation


1.9.12 / 2023-07-26
==================

* Fix: subtitles & captions keyboard accessibility
* Refactored ads plugin  (advertising module)


1.9.11 / 2023-07-16
==================

* Add files & types to package.json
* Turn seek-thumbnail on by default
* Fix: seek-thumbnail compatibility with other plugins


1.9.10 / 2023-06-18
==================

- Fix: Source syntax issue
- Fix: Shoppable Video - product carousel overlay display error
- Add aria-label to logo link


1.9.9 / 2023-03-27
==================

- Video Player Accessibility issue (empty elements in DOM)


1.9.8 / 2023-03-13
==================

- Make Cloudinary analytics opt-out
- Send video duration to via Cloudinary analytics


1.9.7 / 2023-02-26
==================

- Update VideoJS to v7.21.2
- Makes tree-shaking optional
- Export chunks to files instead of sub-folders


1.9.6 / 2023-02-26
==================


1.9.5 / 2023-01-15
==================

Fixes
-----------
- CLD analytics events (#362)

Changes
-------------
- New bundler (Webpack 5)
- Lazy loaded Dash plugin
- Export ESM tree-shakable module
- Webpack major upgrade from 4 to 5 (latest)
- DashJS upgrade to latest v4.5.2
- VideoJS upgrade to latest v7.20.3


1.9.4 / 2022-11-15
==================

Fixes
-----------
Fix:  Support HLS when using playlist

Changes
-------------
Add analytics


1.9.3 / 2022-09-13
==================

Changes
-----------
- Add an option to disable the poster and set a poster background color instead
- Post IE clean up


1.9.2 / 2022-08-29
==================

Changes
----------
Update Cloudinary sdk to version 1.8.6

Fixes
------------
- Fix: Playlist clicking on Next video icon, the player skips a video


1.9.1 / 2022-04-10
==================

Fixes
------
Fix: ie11 support fix

1.9.0 / 2022-03-28
==================

Fixes
----------
- Fix: Video player with interactionArea + Ad issue

Changes
----------
- Using new SDK , no need to get cloudinary-core-shrinkwrap script anymore
- Update webpack-dev-server version to 4.7.4
- Update webpack-bundle-analyzer to 4.5.0
- Addin syncOffsetTime for interaction area - sync video playing time on zoom
- Remove the use vidoejs.log and replace it with a native console.log function


1.8.0 / 2022-01-31
==================

Changes:
----------
Update Dash.js to version 4.2.1
Update Videojs to 7.17.0

Fixes
-------
Fix: Ad is frozen when using floatingWhenNotVisible
Fix: Replace context-menu plugin
Fix: Set playsinline as default for ios devices
Fix: Icons in playlist mode were missing
Fix: The hotspot is out of the frame in shoppable video
Fix: change hls to vhs in documentation code


1.7.0 / 2022-01-03
==================

Fixes
-----------
Fix: Fire error event if has any HLS mediaRequestsErrored
Fix: Escape video tag id
Fix: support error code 3 on Safari
Fix: Dash seek may pass invalid currentTime value.

1.5.9 / 2021-11-02
==================

Fixes:
--------
Fix: Be able to go back if zoom into a video with an error.
Fix: ie11 support fix

Changes:
----------
Rename player interactionAreas config property to interactionDisplay

1.5.8 / 2021-10-20
==================

Fixes
------- 
- fix : Webpack build support  ie11
- fix : Mark VideoJs font-family as !important
- fix : Hide bigPlayButton when using interaction-areas

1.5.7 / 2021-09-30
==================

Fixes
------- 
Validators only display console warring, do not mark player as invalid

1.6.2-edge.13 / 2021-09-26
==================

Fixes
------
playedEventTimes event was fired once 

1.6.2-edge.12 / 2021-08-17
==================

Changes
------------
set manual interaction areas template using config and not a function

1.6.2-edge.11 / 2021-08-11
==================

Changes
---------
Webpack should not remove console.error

1.6.2-edge.10 / 2021-08-08
==================

Changes
---------
- Add validators for video player configs 
- interaction areas have not been supported in the light version

1.6.2-edge.9 / 2021-08-04
==================

fixes
-----
webpack build fix

changes:
---------
adding a transition to interaction-area items

1.6.2-edge.8 / 2021-07-27
==================

Fixes:
----------
fix: console error when passing transformation array to a source

1.6.2-edge.7 / 2021-07-26
==================

Fixes
-------
Check if interaction areas layout enable fix

1.6.2-edge.6 / 2021-07-25
==================

Fixes:
------------
fix:  interaction-areas layout glitching 
fix : style hover interaction-areas layout 

Changes:
------------
Changing video-player interaction-areas config

1.6.2-edge.5 / 2021-07-22
==================

Fixes
-----------------
fix css glitch for interaction-areas-container
video not working if google analytics script is missing

Changes
---------
improve interaction area layout message

1.6.2-edge.4 / 2021-07-21
==================

Fixes
-------
small fix - check if interactionLayout object is defined

1.6.2-edge.3 / 2021-07-20
==================

Changes:
-------------------
Improve interaction area position function
Add pulse animation to the dots on video zoom
Hide Interaction areas layout message after 2.5 sec

1.6.2-edge.2 / 2021-07-15
==================

Fixes:
-------------
fix:  Do not add video codec if it is already defined.
fix:  Interaction area point should be as video player Skin theme color
fix:  Hover on the mute\unmute button, Video controllers move outside of the video container

1.6.2-edge.1 / 2021-07-13
==================

Fixes:
--------------
fix: in some cases interaction area dots get stuck 
fix: layout message disappears when video on autoplay mode
fix: after zoom out in full screen the interaction areas move (set manually) 
fix: interaction area dots flickering 

Other Changes
--------------
update dependencies

1.6.2-edge.0 / 2021-07-05
==================

Fixes:
--------
fix: source copy, ie11 fix
fix: interaction areas size in full screen are not on the right size

Other Changes
--------------
interaction areas new look

1.6.1-edge.6 / 2021-06-30
==================

Fixes
--------
fix: option { controlBar: false } generates errors 
fix: more ie fix , source copy for ie fix

1.6.1-edge.5 / 2021-06-27
==================

Fixes
---------
IE11 fixes

1.6.1-edge.4 / 2021-06-23
==================

Fixes
--------
fix play big button z-index bug

1.6.1-edge.3 / 2021-06-22
==================

Fixes
------------
fix videos in dash not playing

1.6.1-edge.2 / 2021-06-20
==================

Fixes
--------
reimplement isObj to work in IE11

1.6.1-edge.1 / 2021-06-16
==================

fix
----
fix: interaction-area auto-cropping calculation function

1.6.1-edge.0 / 2021-06-14
==================

fixed:
--------
some refactoring 

1.6.0-edge.2 / 2021-06-14
==================

Fixes
---------
some refactoring
 

1.6.0-edge.1 / 2021-06-13
==================

Fixes
------
fix:  workaround safari hls h265 problem
fix: add a source if there is no codec


1.6.0-edge.0 / 2021-06-02
==================

New functionality and features
------------------------------
* Add interaction areas (#254)
* Add handling non existent texttracks (#252)

Fixes
------------------------------
* Fix fluid posted CSS (#247)
* Fix handleCldError not returning statusCode (#248)
* Fix retry timeout not clearing on play (#240)
* Fix big button disappearing in IE11 (#244)

Other Changes
------------------------------
* Update dependencies (#236)
* Minor refactor for code syntax (linting + let/const)

1.5.3 / 2021-03-29
==================

Fixes
-----
* Fix seek thumbnails for adaptive videos (#232)
* Filter out dash sources on safari (#235)
* Update subtitles crossorigin definition to be "anonymous"
* Fix recommendations displayed in the light version
* Fix autoplay on fallback (#227)
* Fix dash seek behavior and error handling (#228)
* Fix error when playing a second HLS video (#226)
* Fix seek thumbnails image path (#223)
* Fix dash.js error handling: pass dash errors to videojs (#219)

Other Changes
---------------
* Add example of how to force subtitles in an HLS stream (#231)
* Use native hls text tracks by default (#229)
* Add type declaration for cloudinary-core module
* Add example of subtitles for playlistByTag (#220)
* bump dashjs to version 3.2.1
* Bump elliptic from 6.5.3 to 6.5.4
* Bump node-notifier from 8.0.0 to 8.0.1
* Bump ini from 1.3.5 to 1.3.7

1.5.2 / 2021-03-25
==================
* This version is identical to 1.5.1

1.5.2-edge.4 / 2021-03-18
==================

Fixes
-----
* Fix seek thumbnails for adaptive videos (#232)
* Filter out dash sources on safari (#235)
* Update subtitles crossorigin definition to be "anonymous"
* Fix recommendations displayed in the light version

Other Changes
-------------
* Bump elliptic from 6.5.3 to 6.5.4
* Add example of how to force subtitles in an HLS stream (#231)
* bump dashjs to version 3.2.1

1.5.2-edge.3 / 2021-02-22
==================

Fixes
-----
* Fix autoplay on fallback (#227)
* Fix dash seek behavior and error handling (#228)

Other changes
-------------
* Use native hls text tracks by default (#229)

1.5.2-edge.2 / 2021-01-18
==================

* Fix error when playing a second HLS video (#226)

1.5.2-edge.1 / 2020-12-29
==================

* Fix seek thumbnails image path (#223)
* Add type declaration for cloudinary-core module
* Bump node-notifier from 8.0.0 to 8.0.1
* Bump ini from 1.3.5 to 1.3.7

1.5.2-edge.0 / 2020-11-23
==================

* Fix dash.js error handling: pass dash errors to videojs (#219)
* Add example for subtitles for playlistByTag (#220)


1.5.1-edge.0 / 2020-11-22
==================

* Fix: remove adaptive streaming from light version

1.5.0 / 2020-11-10
==================

New functionality and features
------------------------------
* Add support for playing raw url
* Add support for quality selector
* Add support for seekbar thumbnails

Fixes
-----
* Fix null error on source change
* Fix ie11 support in Shoppable Videos
* Fix raw url source type
* Fix shoppable video hotspot timing
* Ignore non existent texttracks
* Fix duplicate logo button
* Fix seek thumbnails in ie11
* Fix dash quality selector
* Fix quality selector in ie11
* Fix text tracks in ie11

Other changes
-------------
* Remove Array.find polyfill
* Update Cloudinary logo
* Set seekThumbnails to false by default
* Generate https sources by default
* Move expose-loader to dev dependencies
* Update dependencies
