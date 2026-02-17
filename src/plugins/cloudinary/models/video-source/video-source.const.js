export const DEFAULT_POSTER_PARAMS = { format: 'jpg', resource_type: 'video' };

export const DEFAULT_VIDEO_PARAMS = {
  resource_type: 'video',
  type: 'upload',
  hdr: false,
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
  hls: 'application/x-mpegURL',
  dash: 'application/dash+xml',

  // See: https://docs.videojs.com/utils_mimetypes.js.html
  opus: 'video/ogg',
  ogv: 'video/ogg',
  mp4: 'video/mp4',
  mov: 'video/mp4',
  m4v: 'video/mp4',
  mkv: 'video/x-matroska',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  aac: 'audio/aac',
  caf: 'audio/x-caf',
  flac: 'audio/flac',
  oga: 'audio/ogg',
  wav: 'audio/wav',
  m3u8: 'application/x-mpegURL',
  mpd: 'application/dash+xml',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp'
};

export const ADAPTIVE_SOURCETYPES = ['hls', 'dash', 'mpd', 'm3u8'];

export const FORMAT_MAPPINGS = {
  hls: 'm3u8',
  dash: 'mpd'
};
