import videojs from 'video.js';

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
  'seekThumbnails'
]);

const INTERACTION_AREAS_TEMPLATE = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
  All: 'all',
  CENTER: 'center'
};

export const TEMPLATE_INTERACTION_AREAS_VTT = {
  [INTERACTION_AREAS_TEMPLATE.PORTRAIT]: 'https://res.cloudinary.com/prod/raw/upload/v1623772481/video-player/vtts/portrait.vtt',
  [INTERACTION_AREAS_TEMPLATE.LANDSCAPE]: 'https://res.cloudinary.com/prod/raw/upload/v1623772303/video-player/vtts/landscape.vtt',
  [INTERACTION_AREAS_TEMPLATE.All]: 'https://res.cloudinary.com/prod/raw/upload/v1623250266/video-player/vtts/all.vtt',
  [INTERACTION_AREAS_TEMPLATE.CENTER]: 'https://res.cloudinary.com/prod/raw/upload/v1623250265/video-player/vtts/center.vtt'
};

export const DEFAULT_HLS_OPTIONS = {
  html5: {
    handlePartialData: false,
    hls: {
      overrideNative: videojs && videojs.browser ? !videojs.browser.IS_IOS && !videojs.browser.IS_SAFARI : true
    }
  }
};

export const INTERACTION_AREAS_CONTAINER_CLASS_NAME = 'interaction-areas-container';

export const FLUID_CLASS_NAME = 'cld-fluid';
