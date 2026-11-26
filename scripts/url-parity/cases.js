// Inputs for the URL-parity fixtures. Outputs are recorded from v4 code, never typed.
// `source` cases run v4 VideoSource directly; `player` cases run the full v4 player.

const ai = 'ai:model_veo-animate;details_(prompt_!flying bee!)';

// From test/unit/videoSource.test.js (v4), one entry per URL-producing test, plus
// variables, conditions, raw transformations, codecs, query parameters and cloud settings.
export const sourceCases = [
  // transformation input shapes
  { id: 'tx-object', publicId: 'sea_turtle', options: { transformation: { fetch_format: 'auto' } } },
  { id: 'tx-array', publicId: 'sea_turtle', options: { transformation: [{ fetch_format: 'auto' }, { streaming_profile: 'hd' }] } },
  { id: 'tx-named', publicId: 'sea_turtle', options: { transformation: 'test' } },
  { id: 'tx-width-array', publicId: 'sea_turtle', options: { transformation: [{ width: 400 }] } },
  { id: 'tx-common-keys', publicId: 'sea_turtle', options: { transformation: { width: 640, height: 360, crop: 'fill', gravity: 'auto', quality: 'auto:good', dpr: 2, background: 'blue', angle: 10, radius: 20, opacity: 80, border: '3px_solid_black', color: 'red', effect: 'sepia', flags: ['splice', 'awebp'], start_offset: 2, end_offset: 8, duration: 6, fps: '15-25', audio_codec: 'aac', bit_rate: '500k', video_sampling: 20, overlay: 'cloudinary_icon', x: 10, y: 20, zoom: 1.5, page: 2, density: 72, delay: 20, default_image: 'avatar.png', aspect_ratio: '16:9', keyframe_interval: 2, streaming_profile: 'hd' } } },
  { id: 'tx-offset-range', publicId: 'sea_turtle', options: { transformation: { offset: [2.5, 8] } } },
  { id: 'tx-offset-percent', publicId: 'sea_turtle', options: { transformation: { start_offset: '10p', end_offset: '90p' } } },
  { id: 'tx-variables', publicId: 'sea_turtle', options: { transformation: [{ variables: [['$w', 400], ['$h', '$w / 2']] }, { width: '$w', height: '$h', crop: 'fill' }] } },
  { id: 'tx-variable-keys', publicId: 'sea_turtle', options: { transformation: { $ratio: 'iw / ih', width: '$ratio * 300', crop: 'scale' } } },
  { id: 'tx-condition', publicId: 'sea_turtle', options: { transformation: [{ if: 'w_gt_1000' }, { width: 1000, crop: 'scale' }, { if: 'end' }] } },
  { id: 'tx-condition-else', publicId: 'sea_turtle', options: { transformation: [{ if: 'duration > 30' }, { end_offset: 30 }, { if: 'else' }, { effect: 'accelerate:50' }, { if: 'end' }] } },
  { id: 'tx-raw-string', publicId: 'sea_turtle', options: { transformation: { raw_transformation: 'e_blur:300/l_text:arial_40:Hello' } } },
  { id: 'tx-raw-and-keys', publicId: 'sea_turtle', options: { transformation: { width: 300, raw_transformation: 'e_loop:3' } } },
  { id: 'tx-chain-overlay', publicId: 'sea_turtle', options: { transformation: [{ overlay: 'video:dog', width: 200, gravity: 'south_east' }, { flags: 'layer_apply' }] } },
  { id: 'tx-text-overlay', publicId: 'sea_turtle', options: { transformation: [{ overlay: { font_family: 'Arial', font_size: 40, text: 'Hello, World!' }, color: 'white' }, { flags: 'layer_apply', gravity: 'north' }] } },

  // source types and codecs
  { id: 'type-default', publicId: 'sea_turtle', options: {} },
  { id: 'type-hls', publicId: 'sea_turtle', options: {}, sourceTypes: ['hls'] },
  { id: 'type-hls-h265', publicId: 'sea_turtle', options: {}, sourceTypes: ['hls/h265'] },
  { id: 'type-dash', publicId: 'sea_turtle', options: {}, sourceTypes: ['dash'] },
  { id: 'type-dash-vp9', publicId: 'sea_turtle', options: {}, sourceTypes: ['dash/vp9'] },
  { id: 'type-dash-vp9-tx', publicId: 'sea_turtle', options: { transformation: [{ fetch_format: 'auto' }, { streaming_profile: 'hd' }] }, sourceTypes: ['dash/vp9'] },
  { id: 'type-hls-h265-tx', publicId: 'sea_turtle', options: { transformation: [{ fetch_format: 'auto' }, { streaming_profile: 'hd' }] }, sourceTypes: ['hls/h265'] },
  { id: 'type-many', publicId: 'sea_turtle', options: { sourceTypes: ['hls', 'dash', 'webm/vp9', 'mp4/h265', 'mp4', 'ogv'] } },
  { id: 'type-mp4-av1', publicId: 'sea_turtle', options: { sourceTypes: ['mp4/av1'] } },
  { id: 'type-webm-vp8', publicId: 'sea_turtle', options: { sourceTypes: ['webm/vp8'] } },
  { id: 'type-hls-sp-custom', publicId: 'sea_turtle', options: { transformation: { streaming_profile: 'full_hd' } }, sourceTypes: ['hls'] },
  { id: 'type-source-transformation', publicId: 'sea_turtle', options: { sourceTypes: ['hls', 'mp4'], transformation: { width: 300 }, sourceTransformation: { hls: [{ streaming_profile: 'sd' }], mp4: [{ quality: 'auto' }] } } },
  { id: 'type-source-transformation-auto', publicId: 'sea_turtle', options: { sourceTransformation: { auto: [{ width: 400 }, { format: 'mp4' }] } } },
  { id: 'type-empty', publicId: 'sea_turtle', options: { sourceTypes: [''] } },
  { id: 'type-empty-tx', publicId: 'sea_turtle', options: { sourceTypes: [''], transformation: { width: 400 } } },
  { id: 'type-empty-format', publicId: 'sea_turtle', options: { sourceTypes: [''], transformation: { fetch_format: 'mp4' } } },
  { id: 'codec-default', publicId: 'sea_turtle', options: {} },
  { id: 'codec-webm-vp9', publicId: 'sea_turtle', options: { sourceTypes: ['webm'], transformation: { video_codec: 'vp9' } } },
  { id: 'codec-vp9-no-type', publicId: 'sea_turtle', options: { transformation: { video_codec: 'vp9' } } },
  { id: 'codec-h265', publicId: 'sea_turtle', options: { transformation: { video_codec: 'h265' } } },
  { id: 'codec-raw-vp9', publicId: 'sea_turtle', options: { raw_transformation: 'vc_vp9' } },
  { id: 'codec-raw-h265', publicId: 'sea_turtle', options: { raw_transformation: 'h265' } },
  { id: 'codec-array-h265', publicId: 'sea_turtle', options: { transformation: [{ video_codec: 'h265' }] } },
  { id: 'codec-object', publicId: 'sea_turtle', options: { transformation: { video_codec: { codec: 'h264', profile: 'basic', level: '3.1' } } } },

  // formats
  { id: 'format-auto', publicId: 'sea_turtle', options: { transformation: { fetch_format: 'auto' } } },
  { id: 'format-auto-video', publicId: 'sea_turtle', options: { transformation: { fetch_format: 'auto:video' } } },
  { id: 'format-mp4', publicId: 'sea_turtle', options: { transformation: { fetch_format: 'mp4' } } },
  { id: 'format-in-array', publicId: 'sea_turtle', options: { transformation: [{ width: 400 }, { fetch_format: 'webm' }] } },
  { id: 'format-alias', publicId: 'sea_turtle', options: { transformation: { format: 'mp4' } } },
  { id: 'format-explicit-type', publicId: 'sea_turtle', options: { sourceTypes: ['webm'], transformation: { fetch_format: 'mp4' } } },

  // public ids, delivery types, resource types
  { id: 'id-folder', publicId: 'samples/elephants', options: {} },
  { id: 'id-extension', publicId: 'sea_turtle.mp4', options: {} },
  { id: 'id-unicode-space', publicId: 'folder/été vidéo', options: {} },
  { id: 'id-version', publicId: 'v1612345678/sea_turtle', options: {} },
  { id: 'delivery-fetch', publicId: 'https://res.cloudinary.com/demo/video/upload/dog.mp4', options: { type: 'fetch' } },
  { id: 'delivery-private', publicId: 'sea_turtle', options: { type: 'private' } },
  { id: 'delivery-authenticated', publicId: 'sea_turtle', options: { type: 'authenticated' } },
  { id: 'delivery-live', publicId: 'live_stream', options: { type: 'live' }, sourceTypes: ['hls'] },
  { id: 'resource-image', publicId: 'sample', options: { resourceType: 'image', transformation: [{ effect: ai }, { format: 'auto:video' }] } },
  { id: 'resource-image-poster', publicId: 'sample', options: { resourceType: 'image', transformation: [{ effect: 'ai:model_veo-animate' }] } },

  // raw URLs
  { id: 'raw-webm-type', publicId: 'https://exmaple.com/test.mp4', options: { sourceTypes: ['webm'] } },
  { id: 'raw-no-type', publicId: 'https://exmaple.com/test.mp4', options: {} },
  { id: 'raw-with-tx', publicId: 'https://media.castit.biz/castit-dev/video/upload/a_0,c_limit,f_mp4,vc_h264,w_600/cit-qa/Videoback/2020/08/03/269085_358976.mp4', options: {} },
  { id: 'raw-no-extension', publicId: 'https://exmaple.com/test', options: { sourceTypes: ['mp4'] } },
  { id: 'raw-params', publicId: 'https://exmaple.com/test.mp4?test=1234&user=eeeee&format=webm', options: {}, sourceTypes: ['webm'] },
  { id: 'raw-anchor', publicId: 'https://exmaple.com/test.mp4#123454', options: {}, sourceTypes: ['webm'] },
  { id: 'raw-m3u8', publicId: 'https://exmaple.com/test.m3u8', options: {} },
  { id: 'raw-hls', publicId: 'https://exmaple.com/test', options: {}, sourceTypes: ['hls'] },
  { id: 'raw-mpd', publicId: 'https://exmaple.com/test.mpd', options: {} },
  { id: 'raw-dash', publicId: 'https://exmaple.com/test', options: {}, sourceTypes: ['dash'] },
  { id: 'raw-cloudinary', publicId: 'https://res.cloudinary.com/demo/video/upload/sp_auto/sea_turtle.m3u8', options: { queryParams: { _s: 'vp' } } },

  // credentials and query parameters
  { id: 'credentials-true', publicId: 'sea_turtle', options: { withCredentials: true }, sourceTypes: ['webm'] },
  { id: 'credentials-false', publicId: 'sea_turtle', options: { withCredentials: false }, sourceTypes: ['webm'] },
  { id: 'credentials-hls', publicId: 'sea_turtle', options: { withCredentials: true }, sourceTypes: ['hls'] },
  { id: 'query-usage', publicId: 'sea_turtle', options: { queryParams: { _s: 'vp' } } },
  { id: 'query-many', publicId: 'sea_turtle', options: { queryParams: { _s: 'vp', token: 'a b&c', n: 1 } }, sourceTypes: ['hls', 'mp4'] },

  // posters
  { id: 'poster-default', publicId: 'sea_turtle', options: {} },
  { id: 'poster-raw-url', publicId: 'sea_turtle', options: { queryParams: { _s: 'vp' }, poster: 'https://cdn.example.com/assets/poster.jpg' } },
  { id: 'poster-query', publicId: 'sea_turtle', options: { queryParams: { _s: 'vp' } } },
  { id: 'poster-public-id', publicId: 'sea_turtle', options: { poster: 'sample' } },
  { id: 'poster-object', publicId: 'sea_turtle', options: { poster: { publicId: 'sample', transformation: { width: 300, crop: 'fill', effect: 'sepia' } } } },
  { id: 'poster-saved', publicId: 'sea_turtle', options: { poster: true } },
  { id: 'poster-saved-tx', publicId: 'sea_turtle', options: { poster: true, posterOptions: { transformation: { width: 400, crop: 'scale' } } } },
  { id: 'poster-saved-private', publicId: 'folder/été vidéo', options: { type: 'private', poster: true, queryParams: { _s: 'vp' } } },
  { id: 'poster-live', publicId: 'live_stream', options: { type: 'live' } },

  // HDR (the display reports HDR through matchMedia)
  { id: 'hdr-supported', publicId: 'sea_turtle', options: { hdr: true }, sourceTypes: ['hls'], hdrDisplay: true },
  { id: 'hdr-unsupported', publicId: 'sea_turtle', options: { hdr: true }, sourceTypes: ['hls'], hdrDisplay: false },
  { id: 'hdr-off', publicId: 'sea_turtle', options: { hdr: false }, sourceTypes: ['hls'], hdrDisplay: true },

  // cloud settings (delivery prefix)
  { id: 'cloud-http', publicId: 'sea_turtle', cloudinaryConfig: { cloud_name: 'demo', secure: false } },
  { id: 'cloud-private-cdn', publicId: 'sea_turtle', cloudinaryConfig: { cloud_name: 'demo', private_cdn: true } },
  { id: 'cloud-secure-distribution', publicId: 'sea_turtle', cloudinaryConfig: { cloud_name: 'demo', private_cdn: true, secure_distribution: 'media.example.com' } },
  { id: 'cloud-cname-http', publicId: 'sea_turtle', cloudinaryConfig: { cloud_name: 'demo', secure: false, cname: 'video.example.com' } },
  { id: 'cloud-cdn-subdomain-http', publicId: 'sea_turtle', cloudinaryConfig: { cloud_name: 'demo', secure: false, cdn_subdomain: true } },
  { id: 'cloud-secure-cdn-subdomain', publicId: 'sea_turtle', cloudinaryConfig: { cloud_name: 'demo', private_cdn: true, secure_cdn_subdomain: true } },
  { id: 'cloud-use-root-path', publicId: 'sea_turtle', cloudinaryConfig: { cloud_name: 'demo', private_cdn: true, use_root_path: true } },
  { id: 'cloud-url-suffix', publicId: 'sea_turtle', cloudinaryConfig: { cloud_name: 'demo', private_cdn: true }, options: { url_suffix: 'my-video' } },
  { id: 'cloud-shorten', publicId: 'sea_turtle', cloudinaryConfig: { cloud_name: 'demo', shorten: true } }
];

// Full v4 player in jsdom. `env` fixes the measured container width and devicePixelRatio.
export const playerCases = [
  { id: 'player-minimal', player: {}, publicId: 'sea_turtle' },
  { id: 'player-source-types', player: {}, publicId: 'sea_turtle', source: { sourceTypes: ['hls', 'mp4'] } },
  { id: 'player-usage-report-off', player: { allowUsageReport: false }, publicId: 'sea_turtle' },
  { id: 'player-transformation', player: { transformation: { width: 600, crop: 'limit' } }, publicId: 'sea_turtle', source: { transformation: { effect: 'sepia' } } },
  { id: 'player-poster-options', player: { posterOptions: { transformation: { width: 300, crop: 'fill' } } }, publicId: 'sea_turtle' },
  { id: 'player-poster-public-id', player: { posterOptions: { publicId: 'sample' } }, publicId: 'sea_turtle' },
  { id: 'player-poster-saved', player: {}, publicId: 'sea_turtle', source: { poster: true } },
  { id: 'player-breakpoints', player: { breakpoints: true }, publicId: 'sea_turtle', env: { width: 640, dpr: 2 } },
  { id: 'player-breakpoints-max-dpr', player: { breakpoints: true, maxDpr: 1.5 }, publicId: 'sea_turtle', env: { width: 1000, dpr: 3 } },
  { id: 'player-breakpoints-hls', player: { breakpoints: true }, publicId: 'sea_turtle', source: { sourceTypes: ['hls'] }, env: { width: 360, dpr: 2 } },
  { id: 'player-aspect-ratio', player: { aspectRatio: '1:1' }, publicId: 'sea_turtle' },
  { id: 'player-crop-pad', player: { aspectRatio: '9:16', cropMode: 'pad', cropPadColor: 'black' }, publicId: 'sea_turtle' },
  { id: 'player-crop-smart', player: { aspectRatio: '4:3', cropMode: 'smart' }, publicId: 'sea_turtle' },
  { id: 'player-chapters', player: {}, publicId: 'sea_turtle', source: { chapters: true } },
  { id: 'player-chapters-private', player: {}, publicId: 'folder/été vidéo', source: { type: 'private', chapters: true } },
  { id: 'player-transcript', player: {}, publicId: 'sea_turtle', source: { textTracks: { captions: { label: 'English', default: true } } } },
  { id: 'player-transcript-lang', player: {}, publicId: 'sea_turtle', source: { textTracks: { subtitles: [{ label: 'French', language: 'fr', default: true }] } } },
  { id: 'player-text-track-url', player: {}, publicId: 'sea_turtle', source: { textTracks: { captions: { label: 'English', language: 'en', url: 'https://res.cloudinary.com/demo/raw/upload/outdoors.vtt' } } } },
  { id: 'player-seek-thumbnails', player: { seekThumbnails: true }, publicId: 'sea_turtle', source: { transformation: { width: 500, streaming_profile: 'hd', video_codec: 'h265' } } },
  { id: 'player-seek-thumbnails-off', player: { seekThumbnails: false }, publicId: 'sea_turtle' },
  { id: 'player-cloud-cname', player: { cloudinaryConfig: { cloud_name: 'demo', secure_distribution: 'media.example.com', private_cdn: true } }, publicId: 'sea_turtle', source: { chapters: true, poster: true } },
  { id: 'player-raw-url', player: {}, publicId: 'https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4' }
];

// Config URLs that player() fetches before it builds the player (fetchAndMergeConfig)
export const configCases = [
  { id: 'config-video', options: { cloudName: 'demo', publicId: 'sea_turtle' } },
  { id: 'config-video-cloudinary-config', options: { cloudinaryConfig: { cloud_name: 'demo' }, publicId: 'sea_turtle' } },
  { id: 'config-video-private-unicode', options: { cloudName: 'demo', publicId: 'folder/été vidéo', type: 'private' } },
  { id: 'config-video-usage-report-off', options: { cloudName: 'demo', publicId: 'sea_turtle', allowUsageReport: false } },
  { id: 'config-video-off', options: { cloudName: 'demo', publicId: 'sea_turtle', videoConfig: false } },
  { id: 'config-video-cname', options: { cloudinaryConfig: { cloud_name: 'demo', private_cdn: true, secure_distribution: 'media.example.com' }, publicId: 'sea_turtle' } },
  { id: 'config-profile-custom', options: { cloudName: 'demo', profile: 'My Profile', publicId: 'sea_turtle' } },
  { id: 'config-profile-raw-url', options: { cloudName: 'demo', profile: 'https://example.com/profiles/custom.json' } },
  { id: 'config-profile-built-in', options: { cloudName: 'demo', profile: 'cld-default', publicId: 'sea_turtle' } }
];
