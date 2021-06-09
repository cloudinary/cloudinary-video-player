export const DEFAULT_POSTER_PARAMS = { format: 'jpg', resource_type: 'video' };

const DEFAULT_VIDEO_SOURCE_TYPES = ['webm/vp9', 'mp4/h265', 'mp4'];

export const DEFAULT_VIDEO_PARAMS = {
  resource_type: 'video',
  type: 'upload',
  transformation: [],
  sourceTransformation: {},
  sourceTypes: DEFAULT_VIDEO_SOURCE_TYPES,
  recommendations: null,
  info: {},
  interactionAreas: {}
};

export const VIDEO_SUFFIX_REMOVAL_PATTERN = RegExp(`\\.(${DEFAULT_VIDEO_SOURCE_TYPES.join('|')})$$`);

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
