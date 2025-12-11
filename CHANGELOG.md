# Changelog

## [2.3.1](https://github.com/cloudinary/cloudinary-video-player/compare/v3.6.1...v2.3.1) (2025-12-11)


### ⚠ BREAKING CHANGES

* new lazy-loaded ABR engine ([#867](https://github.com/cloudinary/cloudinary-video-player/issues/867))
* remove light version
* player core is the default ES export
* the default ES import is now only the player core plugins need to be explicitly imported

### Features

* adaptive-streaming startegies ([847f649](https://github.com/cloudinary/cloudinary-video-player/commit/847f64997b6c8527858e16c45f718fcf9da2ff46))
* add internal analytics about new method & profiles ([63e06a9](https://github.com/cloudinary/cloudinary-video-player/commit/63e06a93bb607f428597789e79d5e68d28b2fe69))
* add internal analytics about new method & profiles ([#699](https://github.com/cloudinary/cloudinary-video-player/issues/699)) ([a1c8c1e](https://github.com/cloudinary/cloudinary-video-player/commit/a1c8c1eb4ffd8362ce4cc7ab5ed47276cc5651ee))
* add release-as input to force version ([28cb20c](https://github.com/cloudinary/cloudinary-video-player/commit/28cb20cc3baf04b1536f15854b66bc3e4550f523))
* add url template for video player profiles ([63e06a9](https://github.com/cloudinary/cloudinary-video-player/commit/63e06a93bb607f428597789e79d5e68d28b2fe69))
* add url template for video player profiles ([#696](https://github.com/cloudinary/cloudinary-video-player/issues/696)) ([d60cb4f](https://github.com/cloudinary/cloudinary-video-player/commit/d60cb4f4fc9d8b0ff2a6f0e21621c6c84063c898))
* allow fetching transcript from url ([#737](https://github.com/cloudinary/cloudinary-video-player/issues/737)) ([62b2f52](https://github.com/cloudinary/cloudinary-video-player/commit/62b2f5279c748fc654c8d2087b6fa5655d58e6a7))
* allow transcript from url ([#737](https://github.com/cloudinary/cloudinary-video-player/issues/737)) ([6cd4bc8](https://github.com/cloudinary/cloudinary-video-player/commit/6cd4bc8c925862220803e2806bdd0d58d39e1604))
* auto-fetch transcripts from language ([#741](https://github.com/cloudinary/cloudinary-video-player/issues/741)) ([62b2f52](https://github.com/cloudinary/cloudinary-video-player/commit/62b2f5279c748fc654c8d2087b6fa5655d58e6a7))
* auto-fetch transcripts from language ([#741](https://github.com/cloudinary/cloudinary-video-player/issues/741)) ([ac1fc1d](https://github.com/cloudinary/cloudinary-video-player/commit/ac1fc1d89fbe1890ace818111d05b40e5478e120))
* bump video player profile package ([#860](https://github.com/cloudinary/cloudinary-video-player/issues/860)) ([fc63d32](https://github.com/cloudinary/cloudinary-video-player/commit/fc63d32970762dc39e26587010b727b52645e6ea))
* chapters/transcription template urls (applets) ([#888](https://github.com/cloudinary/cloudinary-video-player/issues/888)) ([cf63bf5](https://github.com/cloudinary/cloudinary-video-player/commit/cf63bf56610515fdcf2cd0f890dca99fc1053301))
* custom data video analytics param ([2aba293](https://github.com/cloudinary/cloudinary-video-player/commit/2aba293436035f2fedfcb51c3063913f1261d564))
* custom data video analytics param ([#687](https://github.com/cloudinary/cloudinary-video-player/issues/687)) ([3f5f828](https://github.com/cloudinary/cloudinary-video-player/commit/3f5f828bdf9506da303978bf095e6572ece766e1))
* enable player-source config inheritance ([847f649](https://github.com/cloudinary/cloudinary-video-player/commit/847f64997b6c8527858e16c45f718fcf9da2ff46))
* fetch auto title & description ([#882](https://github.com/cloudinary/cloudinary-video-player/issues/882)) ([6769344](https://github.com/cloudinary/cloudinary-video-player/commit/6769344668a54686b4414a713d9f09381eec0f54))
* hdr support for HLS streams ([847f649](https://github.com/cloudinary/cloudinary-video-player/commit/847f64997b6c8527858e16c45f718fcf9da2ff46))
* karaoke style subtitles ([f6e5871](https://github.com/cloudinary/cloudinary-video-player/commit/f6e5871cec7985b1db8adf4f4a74cc8a4cb60ea6))
* kareoke style subtitles ([#563](https://github.com/cloudinary/cloudinary-video-player/issues/563)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))
* kareoke style subtitles ([#563](https://github.com/cloudinary/cloudinary-video-player/issues/563)) ([99c1830](https://github.com/cloudinary/cloudinary-video-player/commit/99c18309c5ebbee5b50c41537d73abd30955b285))
* light esm build ([#765](https://github.com/cloudinary/cloudinary-video-player/issues/765)) ([e0e803e](https://github.com/cloudinary/cloudinary-video-player/commit/e0e803e22442b6f69386691dd750b7be09ffd36b))
* light esm build ([#765](https://github.com/cloudinary/cloudinary-video-player/issues/765)) ([0049fb9](https://github.com/cloudinary/cloudinary-video-player/commit/0049fb90cf9702cfb82b48c6911bedd319835dc8))
* live streams analytics ([#862](https://github.com/cloudinary/cloudinary-video-player/issues/862)) ([bcb3eca](https://github.com/cloudinary/cloudinary-video-player/commit/bcb3eca45abeb4878a002c518e634609e69a5cb1))
* migrate to GA4 ([#857](https://github.com/cloudinary/cloudinary-video-player/issues/857)) ([58cf3a7](https://github.com/cloudinary/cloudinary-video-player/commit/58cf3a7f14ab9cbf4bc1b44035fe956482ffd230))
* new 'player' method with support async loading & profiles ([2aba293](https://github.com/cloudinary/cloudinary-video-player/commit/2aba293436035f2fedfcb51c3063913f1261d564))
* new 'player' method with support async loading & profiles ([#678](https://github.com/cloudinary/cloudinary-video-player/issues/678)) ([95098c0](https://github.com/cloudinary/cloudinary-video-player/commit/95098c0a43a34c6f616cf05a6218f41959aa1496))
* new lazy-loaded ABR engine ([#867](https://github.com/cloudinary/cloudinary-video-player/issues/867)) ([847f649](https://github.com/cloudinary/cloudinary-video-player/commit/847f64997b6c8527858e16c45f718fcf9da2ff46))
* schema json exported in build files ([#891](https://github.com/cloudinary/cloudinary-video-player/issues/891)) ([d7526b8](https://github.com/cloudinary/cloudinary-video-player/commit/d7526b8c238ad3f4fcda4a442cf3793ce5e35d30))
* source switcher ([#904](https://github.com/cloudinary/cloudinary-video-player/issues/904)) ([c77e1f8](https://github.com/cloudinary/cloudinary-video-player/commit/c77e1f8e3ee43d7c18dc7ecbaf27ad0f76a62987))
* subtitles on demand ([#898](https://github.com/cloudinary/cloudinary-video-player/issues/898)) ([e674123](https://github.com/cloudinary/cloudinary-video-player/commit/e67412393a41970001132ec827c0b25d7f772ce3))
* support srt subtitle format ([#743](https://github.com/cloudinary/cloudinary-video-player/issues/743)) ([e0e803e](https://github.com/cloudinary/cloudinary-video-player/commit/e0e803e22442b6f69386691dd750b7be09ffd36b))
* support srt subtitle format ([#743](https://github.com/cloudinary/cloudinary-video-player/issues/743)) ([4b69cc0](https://github.com/cloudinary/cloudinary-video-player/commit/4b69cc072becbcc1ee9de0200997846dad8e82ca))
* support srt subtitle format ([#743](https://github.com/cloudinary/cloudinary-video-player/issues/743)) ([62b2f52](https://github.com/cloudinary/cloudinary-video-player/commit/62b2f5279c748fc654c8d2087b6fa5655d58e6a7))
* support srt subtitle format ([#743](https://github.com/cloudinary/cloudinary-video-player/issues/743)) ([46b77b1](https://github.com/cloudinary/cloudinary-video-player/commit/46b77b108f73b96c95fee4a40d600c70667cea40))
* support srt subtitle format ([#743](https://github.com/cloudinary/cloudinary-video-player/issues/743)) ([a0a2598](https://github.com/cloudinary/cloudinary-video-player/commit/a0a2598b81c12621663c18c73aa18acc7ae93e0e))
* support srt subtitle format ([#743](https://github.com/cloudinary/cloudinary-video-player/issues/743)) ([3461a76](https://github.com/cloudinary/cloudinary-video-player/commit/3461a7675839c91008d15c9b575d9fbeea61c899))
* video profiles ([#539](https://github.com/cloudinary/cloudinary-video-player/issues/539)) ([0e99c27](https://github.com/cloudinary/cloudinary-video-player/commit/0e99c27d41ed3d6667d939f6f75fedb3f04e4faf))
* **VIDEO-19871:** control-bar download button ([#893](https://github.com/cloudinary/cloudinary-video-player/issues/893)) ([d088057](https://github.com/cloudinary/cloudinary-video-player/commit/d08805780e7b111f9edb47398bc7ce5404e65820))
* **VIDEO-20042:** image to video (resourceType: 'image') ([#916](https://github.com/cloudinary/cloudinary-video-player/issues/916)) ([68abf29](https://github.com/cloudinary/cloudinary-video-player/commit/68abf29d6b545681112cbbfcfa1a8cc92e6a23e9))
* **VIDEO-20073:** video-specific config ([#920](https://github.com/cloudinary/cloudinary-video-player/issues/920)) ([210a235](https://github.com/cloudinary/cloudinary-video-player/commit/210a2352ad5c890174de10a03f7662b8c70482cf))
* **VIDEO-20110:** video-elements - add support for poster ([#926](https://github.com/cloudinary/cloudinary-video-player/issues/926)) ([2dfb862](https://github.com/cloudinary/cloudinary-video-player/commit/2dfb86246375719eca06680598cd5c2d1faa0f94))
* visual search plugin ([#841](https://github.com/cloudinary/cloudinary-video-player/issues/841)) ([55d5001](https://github.com/cloudinary/cloudinary-video-player/commit/55d5001218c066aebcb3b3b3c515ca847a006af8))


### Bug Fixes

* actions ([20067c3](https://github.com/cloudinary/cloudinary-video-player/commit/20067c303879e89d5b2648399dd3b2ff42ab0f8d))
* add big pause button for mobile browsers ([ba1f966](https://github.com/cloudinary/cloudinary-video-player/commit/ba1f966f22026a6cc38c93bc9a25d3b5fb026bf7))
* add lazy-loaded modules to default bundle ([#527](https://github.com/cloudinary/cloudinary-video-player/issues/527)) ([b6019ae](https://github.com/cloudinary/cloudinary-video-player/commit/b6019ae9885d03af80e6a90f9c06c164dd3088c6))
* add live stream error screen & auto refresh ([#819](https://github.com/cloudinary/cloudinary-video-player/issues/819)) ([9fc9f7a](https://github.com/cloudinary/cloudinary-video-player/commit/9fc9f7a5251529203e5b8ecbd0e88d61b6110578))
* add live streaming profile ([#803](https://github.com/cloudinary/cloudinary-video-player/issues/803)) ([110e11a](https://github.com/cloudinary/cloudinary-video-player/commit/110e11a2a27d18af9caa7c5701ef91ca866588f1))
* add OIDC permissions to publish jobs ([b7edacf](https://github.com/cloudinary/cloudinary-video-player/commit/b7edacf7196d8ddb706674f432bce332581c8afa))
* add visual-search to /all bundle ([96ac989](https://github.com/cloudinary/cloudinary-video-player/commit/96ac9898899ccfb302c51787402544b35ca79117))
* allow Dash ABR on Safari ([#532](https://github.com/cloudinary/cloudinary-video-player/issues/532)) ([cbf80f4](https://github.com/cloudinary/cloudinary-video-player/commit/cbf80f40f106ec3776a10861fb0e062151407491))
* allowUsageReport ([#569](https://github.com/cloudinary/cloudinary-video-player/issues/569)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))
* allowUsageReport ([#569](https://github.com/cloudinary/cloudinary-video-player/issues/569)) ([5d332d2](https://github.com/cloudinary/cloudinary-video-player/commit/5d332d2d9acf29d293ec3a78d7f4befbe8e67bb7))
* av1 support ([#557](https://github.com/cloudinary/cloudinary-video-player/issues/557)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))
* av1 support ([#557](https://github.com/cloudinary/cloudinary-video-player/issues/557)) ([f6e5871](https://github.com/cloudinary/cloudinary-video-player/commit/f6e5871cec7985b1db8adf4f4a74cc8a4cb60ea6))
* av1 support ([#557](https://github.com/cloudinary/cloudinary-video-player/issues/557)) ([a033c91](https://github.com/cloudinary/cloudinary-video-player/commit/a033c91a9196e47aebb717c25546319258a2f852))
* babel config ([0d7b818](https://github.com/cloudinary/cloudinary-video-player/commit/0d7b818919cc9ef64c87e720c76ea110e0c78611))
* bump video analytics, trigger analytics event only once ([#637](https://github.com/cloudinary/cloudinary-video-player/issues/637)) ([1b04cc8](https://github.com/cloudinary/cloudinary-video-player/commit/1b04cc8063aa719d86253bf6f5ff886ec4b1292a))
* bump video analytics, trigger analytics event only once ([#637](https://github.com/cloudinary/cloudinary-video-player/issues/637)) ([d5f7a77](https://github.com/cloudinary/cloudinary-video-player/commit/d5f7a77c9696832c747e52662d284203b12cc497))
* bump video analytics, trigger analytics event only once ([#637](https://github.com/cloudinary/cloudinary-video-player/issues/637)) ([cbb0d07](https://github.com/cloudinary/cloudinary-video-player/commit/cbb0d072a19a5ab4104a45e0e2c166de97d804bf))
* chapters in Safari ([54b2cd2](https://github.com/cloudinary/cloudinary-video-player/commit/54b2cd232bd77781d120e05e061a7ab0ac3e9ea4))
* chapters in Safari ([#531](https://github.com/cloudinary/cloudinary-video-player/issues/531)) ([3d77f27](https://github.com/cloudinary/cloudinary-video-player/commit/3d77f27b9bbba8fccd73058be1afeb59455e4039))
* chapters innerHTML to innerText ([#671](https://github.com/cloudinary/cloudinary-video-player/issues/671)) ([d9b6251](https://github.com/cloudinary/cloudinary-video-player/commit/d9b62513c7abe9eba3458c5193f178ebc6250543))
* chapters innerHTML to innerText ([#671](https://github.com/cloudinary/cloudinary-video-player/issues/671)) ([124663f](https://github.com/cloudinary/cloudinary-video-player/commit/124663f943f5e1060819ca1658032da2aebd4afe))
* cld errors return videojs errors ([#872](https://github.com/cloudinary/cloudinary-video-player/issues/872)) ([c3f6413](https://github.com/cloudinary/cloudinary-video-player/commit/c3f6413688fd5f84b46c8a626536ea674bf1b202))
* Contrast (Minimum) (WCAG SC 1.4.3) ([#817](https://github.com/cloudinary/cloudinary-video-player/issues/817)) ([97e36f5](https://github.com/cloudinary/cloudinary-video-player/commit/97e36f5234bf71f5b16162eae00dcc1adcf1928b))
* controlbar shadow when controls: false ([#830](https://github.com/cloudinary/cloudinary-video-player/issues/830)) ([8f88dd6](https://github.com/cloudinary/cloudinary-video-player/commit/8f88dd639919c7a3c2701ce0b6c2af0a2076ec9b))
* custom profile docs example ([#673](https://github.com/cloudinary/cloudinary-video-player/issues/673)) ([d9b6251](https://github.com/cloudinary/cloudinary-video-player/commit/d9b62513c7abe9eba3458c5193f178ebc6250543))
* custom profile docs example ([#673](https://github.com/cloudinary/cloudinary-video-player/issues/673)) ([3c728c1](https://github.com/cloudinary/cloudinary-video-player/commit/3c728c17711541d04b83e427b4bc6b01f80d6823))
* debug mode analytics ([#611](https://github.com/cloudinary/cloudinary-video-player/issues/611)) ([4749352](https://github.com/cloudinary/cloudinary-video-player/commit/4749352a4a1972d536ee7449273ae8266757bf53))
* default config merge with user config ([#827](https://github.com/cloudinary/cloudinary-video-player/issues/827)) ([19da7aa](https://github.com/cloudinary/cloudinary-video-player/commit/19da7aa26c708689030455dbdd38dbd9514e0849))
* default secure option for new method ([#698](https://github.com/cloudinary/cloudinary-video-player/issues/698)) ([0d95b76](https://github.com/cloudinary/cloudinary-video-player/commit/0d95b76381b2130a01755feab87bb2766ead9d59))
* **deps-dev:** update follow-redirects from 1.15.3 to 1.15.5 ([#516](https://github.com/cloudinary/cloudinary-video-player/issues/516)) ([8c35cec](https://github.com/cloudinary/cloudinary-video-player/commit/8c35cec3cf17148597531d6a8104db7dc1b4d6a6))
* disable component-in-tag for release-please ([1389d45](https://github.com/cloudinary/cloudinary-video-player/commit/1389d4501685506d367a32bdc662f52ef4234247))
* docs for profiles & analytics, analytics options ([#689](https://github.com/cloudinary/cloudinary-video-player/issues/689)) ([e771770](https://github.com/cloudinary/cloudinary-video-player/commit/e771770eebb2f571616c2e4fae6b94a807f61b3b))
* echo ([2212fdf](https://github.com/cloudinary/cloudinary-video-player/commit/2212fdfe13c9480bc9015686f2b89e4d78f67853))
* edge to master ([#730](https://github.com/cloudinary/cloudinary-video-player/issues/730)) ([5807863](https://github.com/cloudinary/cloudinary-video-player/commit/580786313f64ddb0eab4eab081b93c05773eba4e))
* error with f_auto AV1 ([#799](https://github.com/cloudinary/cloudinary-video-player/issues/799)) ([b172e18](https://github.com/cloudinary/cloudinary-video-player/commit/b172e18e1af802d6de0898354a0abb90c0ad087a))
* errors display when using HLS ([#880](https://github.com/cloudinary/cloudinary-video-player/issues/880)) ([ab7db75](https://github.com/cloudinary/cloudinary-video-player/commit/ab7db75f9e4ab84234a6dda57af1f08688edc70d))
* eslintrc ([#604](https://github.com/cloudinary/cloudinary-video-player/issues/604)) ([a749b23](https://github.com/cloudinary/cloudinary-video-player/commit/a749b2376756a8cb5d0e34fc653fa76136b8e566))
* ESM chunk styles ([#629](https://github.com/cloudinary/cloudinary-video-player/issues/629)) ([323492f](https://github.com/cloudinary/cloudinary-video-player/commit/323492fbcf6f0e62f40f49fbb7790794e775b98a))
* esm example pages (ME-16168) ([#613](https://github.com/cloudinary/cloudinary-video-player/issues/613)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* esm example pages (ME-16168) ([#613](https://github.com/cloudinary/cloudinary-video-player/issues/613)) ([e7c601d](https://github.com/cloudinary/cloudinary-video-player/commit/e7c601d43b0416657854193e07d21b8e1691c14b))
* esm examples ([18a1b4f](https://github.com/cloudinary/cloudinary-video-player/commit/18a1b4f4dc1c728eaeeb2eaf981bec495b9fe3d8))
* esm examples ([#609](https://github.com/cloudinary/cloudinary-video-player/issues/609)) ([81c0831](https://github.com/cloudinary/cloudinary-video-player/commit/81c083166ef1b25123a1f805e8e12b9b4b290aa6))
* fetchLatestRelease ([42207bb](https://github.com/cloudinary/cloudinary-video-player/commit/42207bb8f1310b84dcf02fca57b316d4150b119f))
* fetchLatestRelease ([831959a](https://github.com/cloudinary/cloudinary-video-player/commit/831959a199ae181460d0cc0c8ca24e73da15e60b))
* fetchLatestRelease ([861f614](https://github.com/cloudinary/cloudinary-video-player/commit/861f614b89cfd838fe3f6adf97284b938e0de426))
* fetchLatestRelease ([4e6e721](https://github.com/cloudinary/cloudinary-video-player/commit/4e6e7210ca26761ee71c154a62f54bca6d97553f))
* filename generated for download button ([#900](https://github.com/cloudinary/cloudinary-video-player/issues/900)) ([a8d0347](https://github.com/cloudinary/cloudinary-video-player/commit/a8d0347783b48e352529edbdf5a066d9e8f8aa41))
* Focus Visible (WCAG 2.4.7) ([#814](https://github.com/cloudinary/cloudinary-video-player/issues/814)) ([229fdfb](https://github.com/cloudinary/cloudinary-video-player/commit/229fdfb7eadbeaff9d294d714a46123c7c238082))
* font-face configuration ([#886](https://github.com/cloudinary/cloudinary-video-player/issues/886)) ([9d8e1ac](https://github.com/cloudinary/cloudinary-video-player/commit/9d8e1ac04086de6c48a17278bef5dbbcb399ae2a))
* GA deploy workflows ([#507](https://github.com/cloudinary/cloudinary-video-player/issues/507)) ([5f2dd5a](https://github.com/cloudinary/cloudinary-video-player/commit/5f2dd5ae3b320e0350adf8f6c0c38be92ac16839))
* github actions deploy workflows ([40ebffe](https://github.com/cloudinary/cloudinary-video-player/commit/40ebffea26f3080e32d58a7eaf7e31bd68b2c470))
* github actions deploy workflows ([5185b57](https://github.com/cloudinary/cloudinary-video-player/commit/5185b5751c92aaeff0053547dc9f234fac7b2abd))
* handle live streams ([#641](https://github.com/cloudinary/cloudinary-video-player/issues/641)) ([1b04cc8](https://github.com/cloudinary/cloudinary-video-player/commit/1b04cc8063aa719d86253bf6f5ff886ec4b1292a))
* handle live streams ([#641](https://github.com/cloudinary/cloudinary-video-player/issues/641)) ([1b04cc8](https://github.com/cloudinary/cloudinary-video-player/commit/1b04cc8063aa719d86253bf6f5ff886ec4b1292a))
* handle live streams ([#641](https://github.com/cloudinary/cloudinary-video-player/issues/641)) ([d5f7a77](https://github.com/cloudinary/cloudinary-video-player/commit/d5f7a77c9696832c747e52662d284203b12cc497))
* handle live streams ([#641](https://github.com/cloudinary/cloudinary-video-player/issues/641)) ([db48830](https://github.com/cloudinary/cloudinary-video-player/commit/db488308d7038993d0416bbe42fa603b0ba1c90d))
* handle styled textTracks usage monitoring ([bcf3cd0](https://github.com/cloudinary/cloudinary-video-player/commit/bcf3cd0d1de61fd6a03cc53c93a38bdabf0016b2))
* improve example pages, remove duplicates ([#831](https://github.com/cloudinary/cloudinary-video-player/issues/831)) ([4d4fc3b](https://github.com/cloudinary/cloudinary-video-player/commit/4d4fc3be5d96bfcbe06605f3b9a1d3cbd79fc751))
* improve focus accent ([aa0b798](https://github.com/cloudinary/cloudinary-video-player/commit/aa0b79834423fb68a9d00e86ae14077df88f7f9c))
* improve release flow ([13d31be](https://github.com/cloudinary/cloudinary-video-player/commit/13d31be833a1cc12b6f9b45ab2eb67bb114ae2a8))
* improve release flow ([da7f05b](https://github.com/cloudinary/cloudinary-video-player/commit/da7f05be80231388e88852d7fc8f938b09458cdf))
* improve release flow ([226ce13](https://github.com/cloudinary/cloudinary-video-player/commit/226ce13899e7a5489bb634ddd8127f21a35d8e38))
* improve release flow ([96f7baa](https://github.com/cloudinary/cloudinary-video-player/commit/96f7baa2f86c8b696c4182a88a2e26d1674cdd39))
* improve release flow ([a4a43ff](https://github.com/cloudinary/cloudinary-video-player/commit/a4a43ff19c753661024f294eb063cd7458a0a256))
* improved analytics ([620b4a0](https://github.com/cloudinary/cloudinary-video-player/commit/620b4a043f7bb967549613d0682803dbc6d6bfb7))
* Improved example pages with Netlify previews ([24763da](https://github.com/cloudinary/cloudinary-video-player/commit/24763dac23bbab337723412897394b2c85fcc281))
* internal analytics ([#878](https://github.com/cloudinary/cloudinary-video-player/issues/878)) ([0cbf5e7](https://github.com/cloudinary/cloudinary-video-player/commit/0cbf5e7527ed995109026691f94b1bc5e34ebd44))
* internal analytics ([#917](https://github.com/cloudinary/cloudinary-video-player/issues/917)) ([83e36cc](https://github.com/cloudinary/cloudinary-video-player/commit/83e36ccc9488512b7b30db44ae73fe347c5d53e9))
* isPlainObject ([#598](https://github.com/cloudinary/cloudinary-video-player/issues/598)) ([7d09a39](https://github.com/cloudinary/cloudinary-video-player/commit/7d09a39fe1868b4b37eb355dda3d78ce81f2dd1a))
* lazy-loaded playlists ([9f89ab3](https://github.com/cloudinary/cloudinary-video-player/commit/9f89ab336420ed470646ff009ff3a1631c6578c8))
* live stream captions display ([#826](https://github.com/cloudinary/cloudinary-video-player/issues/826)) ([0b72dbb](https://github.com/cloudinary/cloudinary-video-player/commit/0b72dbb77542bd59a095184e24d6b462efae66c1))
* make sure we have source on cldsourcechanged ([#871](https://github.com/cloudinary/cloudinary-video-player/issues/871)) ([dd71bfe](https://github.com/cloudinary/cloudinary-video-player/commit/dd71bfe80d9daf0af82daaccf8af074eb8061069))
* make video-config configurable ([ed1fbef](https://github.com/cloudinary/cloudinary-video-player/commit/ed1fbef2f79619f638ad536a0fbe5a015170ca5d))
* Me 18059 esm tests over preview build ([63e06a9](https://github.com/cloudinary/cloudinary-video-player/commit/63e06a93bb607f428597789e79d5e68d28b2fe69))
* merge profile config with source config ([#887](https://github.com/cloudinary/cloudinary-video-player/issues/887)) ([05a6fe4](https://github.com/cloudinary/cloudinary-video-player/commit/05a6fe48be8edade4cfdbe0f06442b8bf7268900))
* mimetypes ([f6e5871](https://github.com/cloudinary/cloudinary-video-player/commit/f6e5871cec7985b1db8adf4f4a74cc8a4cb60ea6))
* mimetypes ([#572](https://github.com/cloudinary/cloudinary-video-player/issues/572)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))
* mimetypes ([#572](https://github.com/cloudinary/cloudinary-video-player/issues/572)) ([4fe8dfc](https://github.com/cloudinary/cloudinary-video-player/commit/4fe8dfc0d6022f05e9ffaee02bfa7f865418b91e))
* multi-audio tracks ([#874](https://github.com/cloudinary/cloudinary-video-player/issues/874)) ([d8b20b4](https://github.com/cloudinary/cloudinary-video-player/commit/d8b20b4018c8ead75991c86d6411786750f2f8ce))
* Non-text contrast (WCAG 1.4.11) ([#816](https://github.com/cloudinary/cloudinary-video-player/issues/816)) ([d78b672](https://github.com/cloudinary/cloudinary-video-player/commit/d78b67286657ac05b2bd0025c6fe7d92b45e6080))
* notify ([8b55411](https://github.com/cloudinary/cloudinary-video-player/commit/8b55411c4c8b833d85724453eec50966d6763c77))
* notify ([67903db](https://github.com/cloudinary/cloudinary-video-player/commit/67903db547d255ae20cc4dcdbe8ce04f16c35702))
* one event for internal analytics ([#728](https://github.com/cloudinary/cloudinary-video-player/issues/728)) ([7552998](https://github.com/cloudinary/cloudinary-video-player/commit/7552998726656d83ba228460b4dc687ae9d0c94d))
* picture in picture toggle ([#522](https://github.com/cloudinary/cloudinary-video-player/issues/522)) ([8c271cc](https://github.com/cloudinary/cloudinary-video-player/commit/8c271cc276ca0c79a87d9c845417311923148d98))
* playlist by tag ([#550](https://github.com/cloudinary/cloudinary-video-player/issues/550)) ([519e737](https://github.com/cloudinary/cloudinary-video-player/commit/519e737409b6e546fabc737524ad3576a9595155))
* playlist chunk styles ([#629](https://github.com/cloudinary/cloudinary-video-player/issues/629)) ([c2b7131](https://github.com/cloudinary/cloudinary-video-player/commit/c2b713139ee5bc6c20db96bbb5c4add6e1b6f473))
* poster image for raw URLs ([#573](https://github.com/cloudinary/cloudinary-video-player/issues/573)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))
* poster image for raw URLs ([#573](https://github.com/cloudinary/cloudinary-video-player/issues/573)) ([f6e5871](https://github.com/cloudinary/cloudinary-video-player/commit/f6e5871cec7985b1db8adf4f4a74cc8a4cb60ea6))
* poster image for raw URLs ([#573](https://github.com/cloudinary/cloudinary-video-player/issues/573)) ([a24d584](https://github.com/cloudinary/cloudinary-video-player/commit/a24d584852fe8c1490cdaa398a062667c37b91c4))
* prevent undefined error when seek-thumbnails are unavailable ([#635](https://github.com/cloudinary/cloudinary-video-player/issues/635)) ([1b04cc8](https://github.com/cloudinary/cloudinary-video-player/commit/1b04cc8063aa719d86253bf6f5ff886ec4b1292a))
* prevent undefined error when seek-thumbnails are unavailable ([#635](https://github.com/cloudinary/cloudinary-video-player/issues/635)) ([d5f7a77](https://github.com/cloudinary/cloudinary-video-player/commit/d5f7a77c9696832c747e52662d284203b12cc497))
* prevent undefined error when seek-thumbnails are unavailable ([#635](https://github.com/cloudinary/cloudinary-video-player/issues/635)) ([f07df6b](https://github.com/cloudinary/cloudinary-video-player/commit/f07df6bc6bee0a450f5284cd1ccb9be2518d2cf3))
* private video poster image ([#833](https://github.com/cloudinary/cloudinary-video-player/issues/833)) ([aa0b798](https://github.com/cloudinary/cloudinary-video-player/commit/aa0b79834423fb68a9d00e86ae14077df88f7f9c))
* private video poster image ([#836](https://github.com/cloudinary/cloudinary-video-player/issues/836)) ([d51ffd8](https://github.com/cloudinary/cloudinary-video-player/commit/d51ffd8423b179401c6b1aba7f34bde49ae808f8))
* profiles docs link ([#683](https://github.com/cloudinary/cloudinary-video-player/issues/683)) ([945366f](https://github.com/cloudinary/cloudinary-video-player/commit/945366fb6d72de73337a22b783ce86c416dd256c))
* profiles error ([#541](https://github.com/cloudinary/cloudinary-video-player/issues/541)) ([0463518](https://github.com/cloudinary/cloudinary-video-player/commit/0463518e06f459d22d4b5c1224f3f375cc546ee8))
* programatic text-tracks in Safari ([#747](https://github.com/cloudinary/cloudinary-video-player/issues/747)) ([62b2f52](https://github.com/cloudinary/cloudinary-video-player/commit/62b2f5279c748fc654c8d2087b6fa5655d58e6a7))
* programatic text-tracks in Safari ([#747](https://github.com/cloudinary/cloudinary-video-player/issues/747)) ([f549240](https://github.com/cloudinary/cloudinary-video-player/commit/f54924008f98e154ff228b927ee4da52035ed11c))
* publish ([e9a369d](https://github.com/cloudinary/cloudinary-video-player/commit/e9a369d2a5c5b11c7e1cc2d3dafc1b504d9e1f5a))
* publish ([14c42fd](https://github.com/cloudinary/cloudinary-video-player/commit/14c42fdacaefbef537306daf061111785150b383))
* publish ([ddfe32c](https://github.com/cloudinary/cloudinary-video-player/commit/ddfe32c2648880b7af09ffe508692f6d887c23d3))
* purge-jsdelivr-cache ([2f8bb94](https://github.com/cloudinary/cloudinary-video-player/commit/2f8bb94c1207bb991fd4e5b0603409b76a2e7723))
* raw URLs from CORs restricted origin ([3b1baed](https://github.com/cloudinary/cloudinary-video-player/commit/3b1baed537172848bbd47cc05cf27655970e5da5))
* release & unpublish ([03932d5](https://github.com/cloudinary/cloudinary-video-player/commit/03932d5bc5f1e5dcf97788e67d23f3d40c8654a5))
* remove braces override ([#670](https://github.com/cloudinary/cloudinary-video-player/issues/670)) ([658d18b](https://github.com/cloudinary/cloudinary-video-player/commit/658d18b6a3e9ca305562233fe848e8b0be405a03))
* remove IE polyfill ([#665](https://github.com/cloudinary/cloudinary-video-player/issues/665)) ([d9b6251](https://github.com/cloudinary/cloudinary-video-player/commit/d9b62513c7abe9eba3458c5193f178ebc6250543))
* remove polyfill ([#665](https://github.com/cloudinary/cloudinary-video-player/issues/665)) ([3e89bc1](https://github.com/cloudinary/cloudinary-video-player/commit/3e89bc12127e9e338709cf751bca96a5d727e3c8))
* remove text tracks fallback ([#905](https://github.com/cloudinary/cloudinary-video-player/issues/905)) ([755e72b](https://github.com/cloudinary/cloudinary-video-player/commit/755e72b4ade15d24f4012737e74c55c25464a8a7))
* remove text tracks notifications ([#910](https://github.com/cloudinary/cloudinary-video-player/issues/910)) ([ae94a3b](https://github.com/cloudinary/cloudinary-video-player/commit/ae94a3bb90b45339381c6f47c41f2339426ea40d))
* retry on hls not using withCredentials ([#912](https://github.com/cloudinary/cloudinary-video-player/issues/912)) ([9cb213c](https://github.com/cloudinary/cloudinary-video-player/commit/9cb213ca98e555191bd7f9848ef06f77e0bff644))
* secure_distribution not passed correctly when fetching profiles ([#883](https://github.com/cloudinary/cloudinary-video-player/issues/883)) ([0a61e34](https://github.com/cloudinary/cloudinary-video-player/commit/0a61e343eae02ade42a76c5e9cc273694430f0f2))
* security issue braces ([#668](https://github.com/cloudinary/cloudinary-video-player/issues/668)) ([a0c5496](https://github.com/cloudinary/cloudinary-video-player/commit/a0c5496abef60804cb762b5c58399cd1f0e07711))
* seek-thumbs positioning ([#766](https://github.com/cloudinary/cloudinary-video-player/issues/766)) ([5a16f74](https://github.com/cloudinary/cloudinary-video-player/commit/5a16f74b66e84f7aab9000a5adc752e843a43280))
* seek-thumbs vtt is being called without credentials ([#794](https://github.com/cloudinary/cloudinary-video-player/issues/794)) ([b82d143](https://github.com/cloudinary/cloudinary-video-player/commit/b82d14345c8939dded35cda4a666c48002e83a67))
* separate edge/master changelogs ([#663](https://github.com/cloudinary/cloudinary-video-player/issues/663)) ([e2cfc09](https://github.com/cloudinary/cloudinary-video-player/commit/e2cfc09573d44712bca8bd46fcea224cd45ff91e))
* slack notifications ([e44663d](https://github.com/cloudinary/cloudinary-video-player/commit/e44663ddacde7750ef7e6e37f6f5f8167f025ef8))
* small improvements to internal-analytics ([acbcd6b](https://github.com/cloudinary/cloudinary-video-player/commit/acbcd6b242acb0bd5367a107d1de3987dcd6e142))
* source analytics ([#738](https://github.com/cloudinary/cloudinary-video-player/issues/738)) ([6c6f126](https://github.com/cloudinary/cloudinary-video-player/commit/6c6f12682d09a55bdfc86742854fd08df35111a2))
* source switcher on mobile, tap ([#908](https://github.com/cloudinary/cloudinary-video-player/issues/908)) ([91e4b2a](https://github.com/cloudinary/cloudinary-video-player/commit/91e4b2adedfe853dfbe9b7b39cd5b5bf7c775c10))
* split chunks styles ([#627](https://github.com/cloudinary/cloudinary-video-player/issues/627)) ([a2bc622](https://github.com/cloudinary/cloudinary-video-player/commit/a2bc622fd0adeea679d859b38621bda5c1014539))
* styled subtitles browser compatibility ([#576](https://github.com/cloudinary/cloudinary-video-player/issues/576)) ([efbee25](https://github.com/cloudinary/cloudinary-video-player/commit/efbee2593b00e34e5dac883593ab2f4ff56e1b28))
* styled subtitles browser compatibility ([#576](https://github.com/cloudinary/cloudinary-video-player/issues/576)) ([ee7f1e2](https://github.com/cloudinary/cloudinary-video-player/commit/ee7f1e2fbf2dc19439240910b522cb574c325523))
* text track with no src should fall-back to transcript ([#640](https://github.com/cloudinary/cloudinary-video-player/issues/640)) ([1b04cc8](https://github.com/cloudinary/cloudinary-video-player/commit/1b04cc8063aa719d86253bf6f5ff886ec4b1292a))
* text track with no src should fall-back to transcript ([#640](https://github.com/cloudinary/cloudinary-video-player/issues/640)) ([d5f7a77](https://github.com/cloudinary/cloudinary-video-player/commit/d5f7a77c9696832c747e52662d284203b12cc497))
* text track with no src should fall-back to transcript ([#640](https://github.com/cloudinary/cloudinary-video-player/issues/640)) ([35e54d9](https://github.com/cloudinary/cloudinary-video-player/commit/35e54d973a87a05bc9cc2a829feb02dc80f195c0))
* type definitions ([0f1ab8a](https://github.com/cloudinary/cloudinary-video-player/commit/0f1ab8af191e598730000b0c79172f10b216a11d))
* types definitions ([#565](https://github.com/cloudinary/cloudinary-video-player/issues/565)) ([a6da706](https://github.com/cloudinary/cloudinary-video-player/commit/a6da7060ce798cd55d2162d172c68369f60bb929))
* types exports ([#565](https://github.com/cloudinary/cloudinary-video-player/issues/565)) ([f6e5871](https://github.com/cloudinary/cloudinary-video-player/commit/f6e5871cec7985b1db8adf4f4a74cc8a4cb60ea6))
* types exports ([#565](https://github.com/cloudinary/cloudinary-video-player/issues/565)) ([b3e0dd5](https://github.com/cloudinary/cloudinary-video-player/commit/b3e0dd5e45fedbddd0f545082bf1fb24dfb70bcb))
* undeprecate Cloudinary.new() (ONCALL-3380) ([#619](https://github.com/cloudinary/cloudinary-video-player/issues/619)) ([174ee48](https://github.com/cloudinary/cloudinary-video-player/commit/174ee4894b5f9395f4d20f048869784bda8f2197))
* undeprecate Cloudinary.new() (ONCALL-3380) ([#619](https://github.com/cloudinary/cloudinary-video-player/issues/619)) ([99de793](https://github.com/cloudinary/cloudinary-video-player/commit/99de7930ebd836e4eceac8a40e728c9712f7005e))
* unify styles (ME-16488) ([#631](https://github.com/cloudinary/cloudinary-video-player/issues/631)) ([8e9d659](https://github.com/cloudinary/cloudinary-video-player/commit/8e9d659def741e7267c946f4505aafd5c6388348))
* unpublish ([cb47571](https://github.com/cloudinary/cloudinary-video-player/commit/cb4757167e247452bc2e68fd5c7127eefee9c652))
* Update CHANGELOG.md ([2f8495d](https://github.com/cloudinary/cloudinary-video-player/commit/2f8495d0a55be20dfa0c552692e0164c1cb0180d))
* update CHANGELOG.md ([#555](https://github.com/cloudinary/cloudinary-video-player/issues/555)) ([edcc655](https://github.com/cloudinary/cloudinary-video-player/commit/edcc6556e27dc6553ab295024a1d6c46c9ca035f))
* update dependencies ([#688](https://github.com/cloudinary/cloudinary-video-player/issues/688)) ([2aba293](https://github.com/cloudinary/cloudinary-video-player/commit/2aba293436035f2fedfcb51c3063913f1261d564))
* update dependencies ([#688](https://github.com/cloudinary/cloudinary-video-player/issues/688)) ([2105a81](https://github.com/cloudinary/cloudinary-video-player/commit/2105a81b77350c88f935cb0ad2b08ab3077eae1a))
* update dependencies ([#746](https://github.com/cloudinary/cloudinary-video-player/issues/746)) ([e0e803e](https://github.com/cloudinary/cloudinary-video-player/commit/e0e803e22442b6f69386691dd750b7be09ffd36b))
* update dependencies ([#746](https://github.com/cloudinary/cloudinary-video-player/issues/746)) ([1ac07ea](https://github.com/cloudinary/cloudinary-video-player/commit/1ac07eaecb92c3bacb9bafb68d90c983156ff314))
* update quality selector check icon ([#853](https://github.com/cloudinary/cloudinary-video-player/issues/853)) ([935e1ae](https://github.com/cloudinary/cloudinary-video-player/commit/935e1aeaf8fed73929586f6bc8cf09430f9e8f1f))
* update release-please config ([1f2c7b7](https://github.com/cloudinary/cloudinary-video-player/commit/1f2c7b7f568b7a6a25f7328b9c86f265a6873c85))
* use cld player profiles package for default profiles ([63e06a9](https://github.com/cloudinary/cloudinary-video-player/commit/63e06a93bb607f428597789e79d5e68d28b2fe69))
* use cld player profiles package for default profiles ([#701](https://github.com/cloudinary/cloudinary-video-player/issues/701)) ([1083b94](https://github.com/cloudinary/cloudinary-video-player/commit/1083b94ac96f4e075d8d820a894703eb644bec7a))
* use tag_name for release detection- ([3b7aa8a](https://github.com/cloudinary/cloudinary-video-player/commit/3b7aa8a761405f192170b02fc0264ed388486ea9))
* use videojs events & re-trigger to analytics package with custom events ([ac69bbb](https://github.com/cloudinary/cloudinary-video-player/commit/ac69bbb37bbb28b432d57648f4c4774b1d5e8029))
* use videojs events & re-trigger to analytics package with custom… ([#639](https://github.com/cloudinary/cloudinary-video-player/issues/639)) ([d9b6251](https://github.com/cloudinary/cloudinary-video-player/commit/d9b62513c7abe9eba3458c5193f178ebc6250543))
* use videojs events & re-trigger to analytics package with custom… ([#639](https://github.com/cloudinary/cloudinary-video-player/issues/639)) ([5dc594b](https://github.com/cloudinary/cloudinary-video-player/commit/5dc594b40487f1b04e09a9f40eeb94f0260e3714))
* **VIDEO-19824:** errors for missing source-maps ([#897](https://github.com/cloudinary/cloudinary-video-player/issues/897)) ([5079ae2](https://github.com/cloudinary/cloudinary-video-player/commit/5079ae2bbea1be2fa2a594f9973e170a1b9723e3))
* **VIDEO-19962:** base64 encode public id for video metadata ([#906](https://github.com/cloudinary/cloudinary-video-player/issues/906)) ([bbae229](https://github.com/cloudinary/cloudinary-video-player/commit/bbae2291a684bd15ee077b1196d8cca531d0e18b))
* **VIDEO-19984:** withCredentials support for new hls package ([#903](https://github.com/cloudinary/cloudinary-video-player/issues/903)) ([6a7419e](https://github.com/cloudinary/cloudinary-video-player/commit/6a7419ead2c7fa1b84dc1ecc4a9fc311f4054bca))
* **VIDEO-20021:** subtitles defined in HLS manifest ([#909](https://github.com/cloudinary/cloudinary-video-player/issues/909)) ([b7b8ec9](https://github.com/cloudinary/cloudinary-video-player/commit/b7b8ec9cee048b0a13e730a436586a617beffe47))
* **VIDEO-20091:** hide shadow when controlBar is hidden ([#924](https://github.com/cloudinary/cloudinary-video-player/issues/924)) ([12b7166](https://github.com/cloudinary/cloudinary-video-player/commit/12b71669b72ce16438254214cde09c848448d01c))
* **VIDEO-20122:** Parsing VTT with cue attributes like 'align' & 'line' ([#927](https://github.com/cloudinary/cloudinary-video-player/issues/927)) ([7795bf6](https://github.com/cloudinary/cloudinary-video-player/commit/7795bf6e784f81cf2d824d54d6f9fbd5b82fd602))
* videojs 8 deprecation warning for videojs.bind ([#744](https://github.com/cloudinary/cloudinary-video-player/issues/744)) ([62b2f52](https://github.com/cloudinary/cloudinary-video-player/commit/62b2f5279c748fc654c8d2087b6fa5655d58e6a7))
* videojs 8 deprecation warning for videojs.bind ([#744](https://github.com/cloudinary/cloudinary-video-player/issues/744)) ([7787c36](https://github.com/cloudinary/cloudinary-video-player/commit/7787c36f5079ba0a819a0a1a715d34192ba17fd0))
* visual search plugin accessibility ([#845](https://github.com/cloudinary/cloudinary-video-player/issues/845)) ([0be5d2d](https://github.com/cloudinary/cloudinary-video-player/commit/0be5d2db28664524d759ddfce4f945f2d6130a95))
* webpack chunk loading global ([#625](https://github.com/cloudinary/cloudinary-video-player/issues/625)) ([323492f](https://github.com/cloudinary/cloudinary-video-player/commit/323492fbcf6f0e62f40f49fbb7790794e775b98a))
* webpack chunk loading global ([#625](https://github.com/cloudinary/cloudinary-video-player/issues/625)) ([40278a2](https://github.com/cloudinary/cloudinary-video-player/commit/40278a23f631249e9dc17f99971df470f6c36a29))
* withCredentials (ME-16117) ([#607](https://github.com/cloudinary/cloudinary-video-player/issues/607)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* withCredentials (ME-16117) ([#607](https://github.com/cloudinary/cloudinary-video-player/issues/607)) ([31e4cbe](https://github.com/cloudinary/cloudinary-video-player/commit/31e4cbe44ffb7cd918fe1b986e17a9e28f5f160a))


### Performance Improvements

* cleanup codec logic ([#590](https://github.com/cloudinary/cloudinary-video-player/issues/590)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* cleanup codec logic ([#590](https://github.com/cloudinary/cloudinary-video-player/issues/590)) ([e31b44e](https://github.com/cloudinary/cloudinary-video-player/commit/e31b44e50cbfcb624ae589bfafe437127b754466))
* debug mode & lazy validators (ME-15925) ([#606](https://github.com/cloudinary/cloudinary-video-player/issues/606)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* debug mode & lazy validators (ME-15925) ([#606](https://github.com/cloudinary/cloudinary-video-player/issues/606)) ([74ffd93](https://github.com/cloudinary/cloudinary-video-player/commit/74ffd93afdb4f2cb223eb3d2e3c777cbb4d24436))
* default export to be base videoPlayer ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* default export to be base videoPlayer ([#588](https://github.com/cloudinary/cloudinary-video-player/issues/588)) ([259cb24](https://github.com/cloudinary/cloudinary-video-player/commit/259cb24ab1226f8c9c8cd720588c8748ee8f9b6b))
* lazy load ads plugin ([#535](https://github.com/cloudinary/cloudinary-video-player/issues/535)) ([981804d](https://github.com/cloudinary/cloudinary-video-player/commit/981804dae2d8939f3edef3fa512ce8398edfc8d2))
* lazy load chapters plugin ([#536](https://github.com/cloudinary/cloudinary-video-player/issues/536)) ([225029b](https://github.com/cloudinary/cloudinary-video-player/commit/225029b9c4d6058d69aaca0d69f40de6e6f2e03e))
* lazy load interaction-areas plugin ([03ec928](https://github.com/cloudinary/cloudinary-video-player/commit/03ec9289633acfece815e912d6f0753754786e0d))
* lazy load shoppable plugin ([0c87bda](https://github.com/cloudinary/cloudinary-video-player/commit/0c87bda8227c28d99e6f25a5d760b72429d8011c))
* lazy loaded recommendation component ([cde7922](https://github.com/cloudinary/cloudinary-video-player/commit/cde7922e37694ab944912abbf3c2f0ef1e8ff8f6))
* update dependencies ([#594](https://github.com/cloudinary/cloudinary-video-player/issues/594)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* update dependencies ([#594](https://github.com/cloudinary/cloudinary-video-player/issues/594)) ([38c5beb](https://github.com/cloudinary/cloudinary-video-player/commit/38c5beba4cbdfb8537a973159193c5854d8f69fa))
* utils refactor & cleanup ([#595](https://github.com/cloudinary/cloudinary-video-player/issues/595)) ([cca439b](https://github.com/cloudinary/cloudinary-video-player/commit/cca439b838aab56a3f13264db6b1188cf5000ef8))
* utils refactor & cleanup ([#595](https://github.com/cloudinary/cloudinary-video-player/issues/595)) ([99ba911](https://github.com/cloudinary/cloudinary-video-player/commit/99ba9118811ce70186996925310b63f8744866fd))


### Miscellaneous Chores

* release 2.3.1 ([d9fee33](https://github.com/cloudinary/cloudinary-video-player/commit/d9fee334f23043ff0bdd91203e4238e2cd51f0fc))

## [3.6.1](https://github.com/cloudinary/cloudinary-video-player/compare/v3.6.0...v3.6.1) (2025-12-11)


### Bug Fixes

* use tag_name for release detection- ([3b7aa8a](https://github.com/cloudinary/cloudinary-video-player/commit/3b7aa8a761405f192170b02fc0264ed388486ea9))

## [3.6.0](https://github.com/cloudinary/cloudinary-video-player/compare/v3.5.2...v3.6.0) (2025-12-10)


### Features

* **VIDEO-20073:** video-specific config ([#920](https://github.com/cloudinary/cloudinary-video-player/issues/920)) ([210a235](https://github.com/cloudinary/cloudinary-video-player/commit/210a2352ad5c890174de10a03f7662b8c70482cf))
* **VIDEO-20110:** video-elements - add support for poster ([#926](https://github.com/cloudinary/cloudinary-video-player/issues/926)) ([2dfb862](https://github.com/cloudinary/cloudinary-video-player/commit/2dfb86246375719eca06680598cd5c2d1faa0f94))


### Bug Fixes

* improved analytics ([620b4a0](https://github.com/cloudinary/cloudinary-video-player/commit/620b4a043f7bb967549613d0682803dbc6d6bfb7))
* update release-please ([1f2c7b7](https://github.com/cloudinary/cloudinary-video-player/commit/1f2c7b7f568b7a6a25f7328b9c86f265a6873c85))

## [3.5.2](https://github.com/cloudinary/cloudinary-video-player/compare/v3.5.1...v3.5.2) (2025-11-06)


### Bug Fixes

* **VIDEO-20122:** Parsing VTT with cue attributes like 'align' & 'line' ([#927](https://github.com/cloudinary/cloudinary-video-player/issues/927)) ([7795bf6](https://github.com/cloudinary/cloudinary-video-player/commit/7795bf6e784f81cf2d824d54d6f9fbd5b82fd602))

## [3.5.1](https://github.com/cloudinary/cloudinary-video-player/compare/v3.5.0...v3.5.1) (2025-10-30)


### Bug Fixes

* add big pause button for mobile browsers ([ba1f966](https://github.com/cloudinary/cloudinary-video-player/commit/ba1f966f22026a6cc38c93bc9a25d3b5fb026bf7))
* **VIDEO-20091:** hide shadow when controlBar is hidden ([#924](https://github.com/cloudinary/cloudinary-video-player/issues/924)) ([12b7166](https://github.com/cloudinary/cloudinary-video-player/commit/12b71669b72ce16438254214cde09c848448d01c))

## [3.5.0](https://github.com/cloudinary/cloudinary-video-player/compare/v3.4.2...v3.5.0) (2025-10-21)


### Features

* **VIDEO-20042:** image to video (resourceType: 'image') ([#916](https://github.com/cloudinary/cloudinary-video-player/issues/916)) ([68abf29](https://github.com/cloudinary/cloudinary-video-player/commit/68abf29d6b545681112cbbfcfa1a8cc92e6a23e9))


### Bug Fixes

* internal analytics ([#917](https://github.com/cloudinary/cloudinary-video-player/issues/917)) ([83e36cc](https://github.com/cloudinary/cloudinary-video-player/commit/83e36ccc9488512b7b30db44ae73fe347c5d53e9))

## [3.4.2](https://github.com/cloudinary/cloudinary-video-player/compare/v3.4.1...v3.4.2) (2025-09-17)


### Bug Fixes

* retry on hls not using withCredentials ([#912](https://github.com/cloudinary/cloudinary-video-player/issues/912)) ([9cb213c](https://github.com/cloudinary/cloudinary-video-player/commit/9cb213ca98e555191bd7f9848ef06f77e0bff644))
* **VIDEO-19962:** base64 encode public id for video metadata ([#906](https://github.com/cloudinary/cloudinary-video-player/issues/906)) ([bbae229](https://github.com/cloudinary/cloudinary-video-player/commit/bbae2291a684bd15ee077b1196d8cca531d0e18b))

## [3.4.1](https://github.com/cloudinary/cloudinary-video-player/compare/v3.4.0...v3.4.1) (2025-09-03)


### Bug Fixes

* remove text tracks notifications ([#910](https://github.com/cloudinary/cloudinary-video-player/issues/910)) ([ae94a3b](https://github.com/cloudinary/cloudinary-video-player/commit/ae94a3bb90b45339381c6f47c41f2339426ea40d))
* source switcher on mobile, tap ([#908](https://github.com/cloudinary/cloudinary-video-player/issues/908)) ([91e4b2a](https://github.com/cloudinary/cloudinary-video-player/commit/91e4b2adedfe853dfbe9b7b39cd5b5bf7c775c10))
* **VIDEO-20021:** subtitles defined in HLS manifest ([#909](https://github.com/cloudinary/cloudinary-video-player/issues/909)) ([b7b8ec9](https://github.com/cloudinary/cloudinary-video-player/commit/b7b8ec9cee048b0a13e730a436586a617beffe47))

## [3.4.0](https://github.com/cloudinary/cloudinary-video-player/compare/v3.3.0...v3.4.0) (2025-09-02)


### Features

* source switcher ([#904](https://github.com/cloudinary/cloudinary-video-player/issues/904)) ([c77e1f8](https://github.com/cloudinary/cloudinary-video-player/commit/c77e1f8e3ee43d7c18dc7ecbaf27ad0f76a62987))


### Bug Fixes

* remove text tracks fallback ([#905](https://github.com/cloudinary/cloudinary-video-player/issues/905)) ([755e72b](https://github.com/cloudinary/cloudinary-video-player/commit/755e72b4ade15d24f4012737e74c55c25464a8a7))

## [3.3.0](https://github.com/cloudinary/cloudinary-video-player/compare/v3.2.1...v3.3.0) (2025-08-21)


### Features

* subtitles on demand ([#898](https://github.com/cloudinary/cloudinary-video-player/issues/898)) ([e674123](https://github.com/cloudinary/cloudinary-video-player/commit/e67412393a41970001132ec827c0b25d7f772ce3))


### Bug Fixes

* **VIDEO-19984:** withCredentials support for new hls package ([#903](https://github.com/cloudinary/cloudinary-video-player/issues/903)) ([6a7419e](https://github.com/cloudinary/cloudinary-video-player/commit/6a7419ead2c7fa1b84dc1ecc4a9fc311f4054bca))

## [3.2.1](https://github.com/cloudinary/cloudinary-video-player/compare/v3.2.0...v3.2.1) (2025-08-12)


### Bug Fixes

* filename generated for download button ([#900](https://github.com/cloudinary/cloudinary-video-player/issues/900)) ([a8d0347](https://github.com/cloudinary/cloudinary-video-player/commit/a8d0347783b48e352529edbdf5a066d9e8f8aa41))

## [3.2.0](https://github.com/cloudinary/cloudinary-video-player/compare/v3.1.1...v3.2.0) (2025-08-11)


### Features

* chapters/transcription template urls (applets) ([#888](https://github.com/cloudinary/cloudinary-video-player/issues/888)) ([cf63bf5](https://github.com/cloudinary/cloudinary-video-player/commit/cf63bf56610515fdcf2cd0f890dca99fc1053301))
* schema json exported in build files ([#891](https://github.com/cloudinary/cloudinary-video-player/issues/891)) ([d7526b8](https://github.com/cloudinary/cloudinary-video-player/commit/d7526b8c238ad3f4fcda4a442cf3793ce5e35d30))
* **VIDEO-19871:** control-bar download button ([#893](https://github.com/cloudinary/cloudinary-video-player/issues/893)) ([d088057](https://github.com/cloudinary/cloudinary-video-player/commit/d08805780e7b111f9edb47398bc7ce5404e65820))


### Bug Fixes

* **VIDEO-19824:** errors for missing source-maps ([#897](https://github.com/cloudinary/cloudinary-video-player/issues/897)) ([5079ae2](https://github.com/cloudinary/cloudinary-video-player/commit/5079ae2bbea1be2fa2a594f9973e170a1b9723e3))

## [3.1.1](https://github.com/cloudinary/cloudinary-video-player/compare/v3.1.0...v3.1.1) (2025-07-21)


### Bug Fixes

* merge profile config with source config ([#887](https://github.com/cloudinary/cloudinary-video-player/issues/887)) ([05a6fe4](https://github.com/cloudinary/cloudinary-video-player/commit/05a6fe48be8edade4cfdbe0f06442b8bf7268900))

## [3.1.0](https://github.com/cloudinary/cloudinary-video-player/compare/v3.0.5...v3.1.0) (2025-07-14)


### Features

* fetch auto title & description ([#882](https://github.com/cloudinary/cloudinary-video-player/issues/882)) ([6769344](https://github.com/cloudinary/cloudinary-video-player/commit/6769344668a54686b4414a713d9f09381eec0f54))


### Bug Fixes

* font-face configuration ([#886](https://github.com/cloudinary/cloudinary-video-player/issues/886)) ([9d8e1ac](https://github.com/cloudinary/cloudinary-video-player/commit/9d8e1ac04086de6c48a17278bef5dbbcb399ae2a))

## [3.0.5](https://github.com/cloudinary/cloudinary-video-player/compare/v3.0.4...v3.0.5) (2025-07-03)


### Bug Fixes

* secure_distribution not passed correctly when fetching profiles ([#883](https://github.com/cloudinary/cloudinary-video-player/issues/883)) ([0a61e34](https://github.com/cloudinary/cloudinary-video-player/commit/0a61e343eae02ade42a76c5e9cc273694430f0f2))

## [3.0.4](https://github.com/cloudinary/cloudinary-video-player/compare/v3.0.3...v3.0.4) (2025-07-01)


### Bug Fixes

* errors display when using HLS ([#880](https://github.com/cloudinary/cloudinary-video-player/issues/880)) ([ab7db75](https://github.com/cloudinary/cloudinary-video-player/commit/ab7db75f9e4ab84234a6dda57af1f08688edc70d))

## [3.0.3](https://github.com/cloudinary/cloudinary-video-player/compare/v3.0.2...v3.0.3) (2025-06-30)


### Bug Fixes

* internal analytics ([#878](https://github.com/cloudinary/cloudinary-video-player/issues/878)) ([0cbf5e7](https://github.com/cloudinary/cloudinary-video-player/commit/0cbf5e7527ed995109026691f94b1bc5e34ebd44))

## [3.0.2](https://github.com/cloudinary/cloudinary-video-player/compare/v3.0.1...v3.0.2) (2025-06-22)


### Bug Fixes

* multi-audio tracks ([#874](https://github.com/cloudinary/cloudinary-video-player/issues/874)) ([d8b20b4](https://github.com/cloudinary/cloudinary-video-player/commit/d8b20b4018c8ead75991c86d6411786750f2f8ce))

## [3.0.1](https://github.com/cloudinary/cloudinary-video-player/compare/v3.0.0...v3.0.1) (2025-06-09)


### Bug Fixes

* cld errors return videojs errors ([#872](https://github.com/cloudinary/cloudinary-video-player/issues/872)) ([c3f6413](https://github.com/cloudinary/cloudinary-video-player/commit/c3f6413688fd5f84b46c8a626536ea674bf1b202))
* make sure we have source on cldsourcechanged ([#871](https://github.com/cloudinary/cloudinary-video-player/issues/871)) ([dd71bfe](https://github.com/cloudinary/cloudinary-video-player/commit/dd71bfe80d9daf0af82daaccf8af074eb8061069))

## [3.0.0](https://github.com/cloudinary/cloudinary-video-player/compare/v2.6.0...v3.0.0) (2025-06-05)


### ⚠ BREAKING CHANGES

* remove light version

### Features

* adaptive-streaming startegies ([847f649](https://github.com/cloudinary/cloudinary-video-player/commit/847f64997b6c8527858e16c45f718fcf9da2ff46))
* enable player-source config inheritance ([847f649](https://github.com/cloudinary/cloudinary-video-player/commit/847f64997b6c8527858e16c45f718fcf9da2ff46))
* hdr support for HLS streams ([847f649](https://github.com/cloudinary/cloudinary-video-player/commit/847f64997b6c8527858e16c45f718fcf9da2ff46))
* new lazy-loaded ABR engine ([#867](https://github.com/cloudinary/cloudinary-video-player/issues/867)) ([847f649](https://github.com/cloudinary/cloudinary-video-player/commit/847f64997b6c8527858e16c45f718fcf9da2ff46))

## [2.6.0](https://github.com/cloudinary/cloudinary-video-player/compare/v2.5.0...v2.6.0) (2025-05-14)


### Features

* bump video player profile package ([#860](https://github.com/cloudinary/cloudinary-video-player/issues/860)) ([fc63d32](https://github.com/cloudinary/cloudinary-video-player/commit/fc63d32970762dc39e26587010b727b52645e6ea))
* live streams analytics ([#862](https://github.com/cloudinary/cloudinary-video-player/issues/862)) ([bcb3eca](https://github.com/cloudinary/cloudinary-video-player/commit/bcb3eca45abeb4878a002c518e634609e69a5cb1))


### Bug Fixes

* add visual-search to /all bundle ([96ac989](https://github.com/cloudinary/cloudinary-video-player/commit/96ac9898899ccfb302c51787402544b35ca79117))

## [2.5.0](https://github.com/cloudinary/cloudinary-video-player/compare/v2.4.1...v2.5.0) (2025-04-29)


### Features

* migrate analytics plugin to GA4 ([#857](https://github.com/cloudinary/cloudinary-video-player/issues/857)) ([58cf3a7](https://github.com/cloudinary/cloudinary-video-player/commit/58cf3a7f14ab9cbf4bc1b44035fe956482ffd230))

## [2.4.1](https://github.com/cloudinary/cloudinary-video-player/compare/v2.4.0...v2.4.1) (2025-04-20)


### Bug Fixes

* update quality selector check icon ([#853](https://github.com/cloudinary/cloudinary-video-player/issues/853)) ([935e1ae](https://github.com/cloudinary/cloudinary-video-player/commit/935e1aeaf8fed73929586f6bc8cf09430f9e8f1f))

## [2.4.0](https://github.com/cloudinary/cloudinary-video-player/compare/v2.3.5...v2.4.0) (2025-04-07)


### Features

* visual search plugin ([#841](https://github.com/cloudinary/cloudinary-video-player/issues/841)) ([55d5001](https://github.com/cloudinary/cloudinary-video-player/commit/55d5001218c066aebcb3b3b3c515ca847a006af8))

## [2.3.5](https://github.com/cloudinary/cloudinary-video-player/compare/v2.3.4...v2.3.5) (2025-03-30)


### Bug Fixes

* controlbar shadow when controls: false ([#830](https://github.com/cloudinary/cloudinary-video-player/issues/830)) ([8f88dd6](https://github.com/cloudinary/cloudinary-video-player/commit/8f88dd639919c7a3c2701ce0b6c2af0a2076ec9b))
* improve example pages, remove duplicates ([#831](https://github.com/cloudinary/cloudinary-video-player/issues/831)) ([4d4fc3b](https://github.com/cloudinary/cloudinary-video-player/commit/4d4fc3be5d96bfcbe06605f3b9a1d3cbd79fc751))
* improve focus accent ([aa0b798](https://github.com/cloudinary/cloudinary-video-player/commit/aa0b79834423fb68a9d00e86ae14077df88f7f9c))
* private video poster image ([#833](https://github.com/cloudinary/cloudinary-video-player/issues/833)) ([aa0b798](https://github.com/cloudinary/cloudinary-video-player/commit/aa0b79834423fb68a9d00e86ae14077df88f7f9c))
* private video poster image ([#836](https://github.com/cloudinary/cloudinary-video-player/issues/836)) ([d51ffd8](https://github.com/cloudinary/cloudinary-video-player/commit/d51ffd8423b179401c6b1aba7f34bde49ae808f8))

## [2.3.4](https://github.com/cloudinary/cloudinary-video-player/compare/v2.3.3...v2.3.4) (2025-03-13)


### Bug Fixes

* add live stream error screen & auto refresh ([#819](https://github.com/cloudinary/cloudinary-video-player/issues/819)) ([9fc9f7a](https://github.com/cloudinary/cloudinary-video-player/commit/9fc9f7a5251529203e5b8ecbd0e88d61b6110578))
* default config merge with user config ([#827](https://github.com/cloudinary/cloudinary-video-player/issues/827)) ([19da7aa](https://github.com/cloudinary/cloudinary-video-player/commit/19da7aa26c708689030455dbdd38dbd9514e0849))
* live stream captions display ([#826](https://github.com/cloudinary/cloudinary-video-player/issues/826)) ([0b72dbb](https://github.com/cloudinary/cloudinary-video-player/commit/0b72dbb77542bd59a095184e24d6b462efae66c1))

## [2.3.3](https://github.com/cloudinary/cloudinary-video-player/compare/v2.3.2...v2.3.3) (2025-02-16)


### Bug Fixes

* Contrast (Minimum) (WCAG SC 1.4.3) ([#817](https://github.com/cloudinary/cloudinary-video-player/issues/817)) ([97e36f5](https://github.com/cloudinary/cloudinary-video-player/commit/97e36f5234bf71f5b16162eae00dcc1adcf1928b))
* Focus Visible (WCAG 2.4.7) ([#814](https://github.com/cloudinary/cloudinary-video-player/issues/814)) ([229fdfb](https://github.com/cloudinary/cloudinary-video-player/commit/229fdfb7eadbeaff9d294d714a46123c7c238082))
* Non-text contrast (WCAG 1.4.11) ([#816](https://github.com/cloudinary/cloudinary-video-player/issues/816)) ([d78b672](https://github.com/cloudinary/cloudinary-video-player/commit/d78b67286657ac05b2bd0025c6fe7d92b45e6080))

## [2.3.2](https://github.com/cloudinary/cloudinary-video-player/compare/v2.3.1...v2.3.2) (2025-01-30)


### Bug Fixes

* add live streaming profile ([#803](https://github.com/cloudinary/cloudinary-video-player/issues/803)) ([110e11a](https://github.com/cloudinary/cloudinary-video-player/commit/110e11a2a27d18af9caa7c5701ef91ca866588f1))

## [2.3.1](https://github.com/cloudinary/cloudinary-video-player/compare/v2.3.1-edge.2...v2.3.1) (2025-01-29)


### Bug Fixes

* error with f_auto AV1 ([#799](https://github.com/cloudinary/cloudinary-video-player/issues/799)) ([b172e18](https://github.com/cloudinary/cloudinary-video-player/commit/b172e18e1af802d6de0898354a0abb90c0ad087a))
* seek-thumbs vtt is being called without credentials ([#794](https://github.com/cloudinary/cloudinary-video-player/issues/794)) ([b82d143](https://github.com/cloudinary/cloudinary-video-player/commit/b82d14345c8939dded35cda4a666c48002e83a67))


### Miscellaneous Chores

* improve release flow ([13d31be](https://github.com/cloudinary/cloudinary-video-player/commit/13d31be833a1cc12b6f9b45ab2eb67bb114ae2a8))


## [2.3.0](https://github.com/cloudinary/cloudinary-video-player/compare/v2.2.0...v2.3.0) (2025-01-07)


### Features

* support srt subtitle format ([#743](https://github.com/cloudinary/cloudinary-video-player/issues/743)) ([e0e803e](https://github.com/cloudinary/cloudinary-video-player/commit/e0e803e22442b6f69386691dd750b7be09ffd36b))
* light esm build ([#765](https://github.com/cloudinary/cloudinary-video-player/issues/765))


### Bug Fixes

* update dependencies ([#746](https://github.com/cloudinary/cloudinary-video-player/issues/746))


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
