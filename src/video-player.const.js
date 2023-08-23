import videojs from 'video.js';
import { camelize } from './utils/string';

export const CLOUDINARY_PARAMS = [
  'cloudinaryConfig',
  'transformation',
  'sourceTypes',
  'sourceTransformation',
  'posterOptions',
  'autoShowRecommendations',
  'fontFace',
  'secure'
];

export const PLAYER_PARAMS = CLOUDINARY_PARAMS.concat([
  'publicId',
  'source',
  'autoplayMode',
  'playedEventPercents',
  'playedEventTimes',
  'analytics',
  'cloudinaryAnalytics',
  'fluid',
  'ima',
  'playlistWidget',
  'hideContextMenu',
  'colors',
  'floatingWhenNotVisible',
  'ads',
  'showJumpControls',
  'textTracks',
  'qualitySelector',
  'fetchErrorUsingGet',
  'withCredentials',
  'seekThumbnails',
  'aiHighlightsGraph',
  'queryParams'
]);

export const CLOUDINARY_CONFIG_PARAM = [
  'cloud_name',
  'secure',
  'private_cdn',
  'secure_distribution',
  'cdn_subdomain',
  'secure_cdn_subdomain',
  'cname',
  'shorten',
  'sign_url',
  'api_secret',
  'url_suffix',
  'use_root_path',
  'auth_token'
  // Support camelCase as well
].map((param) => ([param, camelize(param)])).flat();

export const DEFAULT_HLS_OPTIONS = {
  html5: {
    handlePartialData: false,
    vhs: {
      overrideNative: videojs && videojs.browser ? !videojs.browser.IS_IOS && !videojs.browser.IS_SAFARI : true
    }
  }
};

export const FLUID_CLASS_NAME = 'cld-fluid';

export const AUTO_PLAY_MODE = {
  ALWAYS: 'always',
  ON_SCROLL: 'on-scroll',
  NEVER: 'never'
};

export const FLOATING_TO = {
  LEFT: 'left',
  RIGHT: 'right',
  NONE: 'none'
};

export const ADS_IN_PLAYLIST = {
  FIRST_VIDEO: 'first-video',
  EVERY_VIDEO: 'every-video'
};

export const PRELOAD = {
  AUTO: 'auto',
  METADATA: 'metadata',
  NONE: 'none'
};
