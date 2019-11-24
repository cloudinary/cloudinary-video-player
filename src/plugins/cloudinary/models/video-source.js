import BaseSource from './base-source';
import ImageSource from './image-source';
import { normalizeOptions, isSrcEqual, codecShorthandTrans, codecToSrcTransformation } from '../common';
import { sliceAndUnsetProperties } from 'utils/slicing';
import assign from 'utils/assign';
import { objectToQuerystring } from 'utils/querystring';


const DEFAULT_POSTER_PARAMS = { format: 'jpg', resource_type: 'video' };
const DEFAULT_VIDEO_SOURCE_TYPES = ['webm/vp9', 'mp4/h265', 'mp4'];

const DEFAULT_VIDEO_PARAMS = {
  resource_type: 'video',
  type: 'upload',
  transformation: [],
  sourceTransformation: {},
  sourceTypes: DEFAULT_VIDEO_SOURCE_TYPES,
  recommendations: null,
  info: {}
};
const VIDEO_SUFFIX_REMOVAL_PATTERN = RegExp(`\\.(${DEFAULT_VIDEO_SOURCE_TYPES.join('|')})$$`);

let objectId = 0;
const generateId = () => objectId++;

class VideoSource extends BaseSource {
  constructor(publicId, options = {}) {
    ({ publicId, options } = normalizeOptions(publicId, options));

    publicId = publicId.replace(VIDEO_SUFFIX_REMOVAL_PATTERN, '');

    options = assign({}, DEFAULT_VIDEO_PARAMS, options);

    if (!options.poster) {
      options.poster = assign({ publicId }, DEFAULT_POSTER_PARAMS);
    }

    const { poster, sourceTypes, sourceTransformation, info, recommendations } =
      sliceAndUnsetProperties(options, 'poster', 'sourceTypes', 'sourceTransformation', 'info', 'recommendations');

    super(publicId, options);

    let _poster = null;
    let _sourceTypes = null;
    let _sourceTransformation = null;
    let _info = null;
    let _recommendations = null;
    this._type = 'VideoSource';

    this.poster = (publicId, options = {}) => {
      if (!publicId) {
        return _poster;
      }

      if (publicId instanceof ImageSource) {
        _poster = publicId;
        return this;
      }

      ({ publicId, options } = normalizeOptions(publicId, options, { tolerateMissingId: true }));

      if (!publicId) {
        publicId = this.publicId();
        options = assign({}, options, DEFAULT_POSTER_PARAMS);
      }

      options.cloudinaryConfig = options.cloudinaryConfig || this.cloudinaryConfig();
      _poster = new ImageSource(publicId, options);

      return this;
    };

    this.sourceTypes = (types) => {
      if (!types) {
        return _sourceTypes;
      }
      _sourceTypes = types;

      return this;
    };

    this.sourceTransformation = (trans) => {
      if (!trans) {
        return _sourceTransformation;
      }

      _sourceTransformation = trans;

      return this;
    };

    this.info = (info) => {
      if (!info) {
        return _info;
      }

      _info = info;

      return this;
    };

    this.recommendations = (recommends) => {
      if (recommends === undefined) {
        return _recommendations;
      }

      _recommendations = recommends;

      return this;
    };

    this.poster(poster);
    this.sourceTypes(sourceTypes);
    this.sourceTransformation(sourceTransformation);
    this.info(info);
    this.recommendations(recommendations);
    this.objectId = generateId();
  }

  contains(source) {
    const sources = this.generateSources();
    return sources.some((_source) => isSrcEqual(_source, source));
  }

  generateSources() {
    return this.sourceTypes().map((sourceType) => {
      let src = null;
      const srcTransformation = this.sourceTransformation()[sourceType] || [this.transformation()];
      const format = normalizeFormat(sourceType);
      const opts = {};
      if (srcTransformation) {
        opts.transformation = srcTransformation;
      }
      assign(opts, { resource_type: 'video', format });

      let queryString = '';
      if (this.queryParams()) {
        queryString = objectToQuerystring(this.queryParams());
      }
      let type = null;
      if (Object.keys(CONTAINER_MIME_TYPES).indexOf(sourceType) > -1) {
        type = CONTAINER_MIME_TYPES[sourceType];
      } else {
        let codecTrans = null;
        [type, codecTrans] = formatToMimeTypeAndTransformation(sourceType);
        if (codecTrans) {
          opts.transformation.push(codecTrans);
        }
      }
      src = `${this.config().url(this.publicId(), opts)}${queryString}`;
      return { type, src, cldSrc: this };
    });
  }
}

const CONTAINER_MIME_TYPES = {
  dash: 'application/dash+xml',
  hls: 'application/x-mpegURL'
};

function formatToMimeTypeAndTransformation(format) {
  let [container, codec] = format.toLowerCase().split('\/');
  let res = CONTAINER_MIME_TYPES[container];
  if (!res) {
    res = [`video/${container}`, null];
  }
  if (codec) {
    codec = codecShorthandTrans(codec);
    let transformation = codecToSrcTransformation(codec);
    return [`${res[0]}; codec="${codec}"`, transformation];
  }
  return res;
}

const FORMAT_MAPPINGS = {
  hls: 'm3u8',
  dash: 'mpd'
};

function normalizeFormat(format) {
  format = format.toLowerCase();

  let res = FORMAT_MAPPINGS[format];
  if (!res) {
    res = format.split('\/').shift();
  }

  return res;
}

export default VideoSource;
