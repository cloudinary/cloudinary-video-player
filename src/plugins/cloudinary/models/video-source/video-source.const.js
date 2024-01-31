export const DEFAULT_POSTER_PARAMS = { format: 'jpg', resource_type: 'video' };

export const DEFAULT_VIDEO_PARAMS = {
  resource_type: 'video',
  type: 'upload',
  transformation: [],
  sourceTransformation: {},
  sourceTypes: ['auto'],
  recommendations: null,
  info: {},
  interactionAreas: {},
  chapters: {}
};

const COMMON_VIDEO_EXTENSIONS = [
  '3g2',
  '3gp',
  'avi',
  'flv',
  'm3u8',
  'ts',
  'm2ts',
  'mts',
  'mov',
  'mkv',
  'mp4',
  'mpeg',
  'mpd',
  'mxf',
  'ogv',
  'webm',
  'wmv'
]; // https://cloudinary.com/documentation/video_manipulation_and_delivery#supported_video_formats

export const VIDEO_SUFFIX_REMOVAL_PATTERN = RegExp(`\\.(${COMMON_VIDEO_EXTENSIONS.join('|')})$$`);

// eslint-disable-next-line no-control-regex
export const URL_PATTERN = RegExp('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\+.~#?&/=]*)');


export const CONTAINER_MIME_TYPES = {
  dash: ['application/dash+xml'],
  hls: ['application/x-mpegURL'],
  mpd: ['application/dash+xml'],
  m3u8: ['application/x-mpegURL']
};

export const FORMAT_MAPPINGS = {
  hls: 'm3u8',
  dash: 'mpd'
};
