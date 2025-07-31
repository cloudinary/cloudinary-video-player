// Parameters that can be passed to source configuration (inherited by source method)
export const SOURCE_PARAMS = [
  'adaptiveStreaming',
  'autoShowRecommendations',
  'chapters',
  'cloudinaryConfig',
  'description',
  'download',
  'info',
  'interactionAreas',
  'poster',
  'posterOptions',
  'publicId',
  'rawTransformation',
  'recommendations',
  'shoppable',
  'source',
  'sourceTransformation',
  'sourceTypes',
  'textTracks',
  'title',
  'transformation',
  'type',
  'visualSearch',
  'withCredentials'
];

// All parameters that can be passed to player constructor
export const PLAYER_PARAMS = SOURCE_PARAMS.concat([
  '_internalAnalyticsMetadata',
  'ads',
  'aiHighlightsGraph',
  'allowUsageReport',
  'analytics',
  'autoplayMode',
  'chaptersButton',
  'cloudinaryAnalytics',
  'colors',
  'debug',
  'fetchErrorUsingGet',
  'floatingWhenNotVisible',
  'fluid',
  'fontFace',
  'hideContextMenu',
  'ima',
  'pictureInPictureToggle',
  'playedEventPercents',
  'playedEventTimes',
  'playlistWidget',
  'qualitySelector',
  'queryParams',
  'seekThumbnails',
  'showJumpControls'
]);

// We support both camelCase and snake_case for cloudinary SDK params
export const CLOUDINARY_CONFIG_PARAM = [
  'api_secret',
  'auth_token',
  'cdn_subdomain',
  'cloud_name', 
  'cname',
  'private_cdn',
  'secure',
  'secure_cdn_subdomain',
  'secure_distribution',
  'shorten',
  'sign_url',
  'url_suffix',
  'use_root_path'
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
