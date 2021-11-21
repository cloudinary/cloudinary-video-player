1.7.0-edge.0 / 2021-11-15
==================

Fixes:
-----
Fix some documentation mistakes

1.6.4-edge.2 / 2021-10-27
==================

Fixes
---------
Fix: Be able to go back if zoom into a video with an error.

1.6.4-edge.1 / 2021-10-21
==================

Changes
-----------
Rename player interactionAreas config property to interactionDisplay

1.6.4-edge.0 / 2021-10-21
==================

Changes
----------
- Rename player interactionAreas config property to interactionDesign 

1.6.3-edge.4 / 2021-10-20
==================

Fixes
-------
change webpack build for ie11 support

1.6.3-edge.3 / 2021-10-20
==================

Fixes
--------
- Hide bigPlayButton and when using interaction-areas

1.6.3-edge.2 / 2021-10-14
==================

Fixes
-----
Mark VideoJs font-family as !important

1.6.3-edge.1 / 2021-10-06
==================

Fixes
--------
Undo 1.6.3-edge.0 changes

1.6.3-edge.0 / 2021-10-06
==================

Fixes:
-------
Should not autoplay after interactions area layout removed if config as autoplay false

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