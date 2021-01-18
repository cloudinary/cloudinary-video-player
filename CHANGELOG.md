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