1.5.5 / 2021-07-26
==================

Fixes:
----------
fix : add withCredentials to player params list

1.5.4 / 2021-07-04
==================

New functionality and features
---------------------------
Add interaction areas (#254)
Add handling non existent texttracks (#252)

Fixes
-----------------
fix fluid poster CSS (#247)
fix handleCldError not returning statusCode (#248)
fix retry timeout not clearing on play (#240)
fix: workaround safari hls h265 problem
fix: add a source if there is no codec
fix: videos in dash not playing
fix: IE11 fixes
fix: option { controlBar: false } generates errors

Other Changes
-------------------
Update dependencies (#236)
Minor refactor for code syntax (linting + let/const)

1.6.1-edge.7 / 2021-07-01
==================

Fixes
-------
Revert fix source copy of ie

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