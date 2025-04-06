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
  '_internalAnalyticsMetadata',
  'debug',
  'publicId',
  'source',
  'autoplayMode',
  'playedEventPercents',
  'playedEventTimes',
  'analytics',
  'cloudinaryAnalytics',
  'allowUsageReport',
  'fluid',
  'ima',
  'playlistWidget',
  'hideContextMenu',
  'colors',
  'floatingWhenNotVisible',
  'ads',
  'showJumpControls',
  'chaptersButton',
  'pictureInPictureToggle',
  'textTracks',
  'qualitySelector',
  'fetchErrorUsingGet',
  'withCredentials',
  'seekThumbnails',
  'aiHighlightsGraph',
  'chapters',
  'queryParams',
  'type',
  'visualSearch'
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
];

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
