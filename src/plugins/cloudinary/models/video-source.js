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

/**
 * Check if key exist in transformation
 * @param transformation
 * @param key
 * @returns true if key exists in transformation, false otherwise
 */
const isKeyInTransformation = (transformation, key) => {
  if (!transformation || !key) {
    return false;
  }

  // transformation is an array so run this function for each item
  if (Array.isArray(transformation)) {
    return !!transformation.find(t => isKeyInTransformation(t, key));
  }

  // transformation is a Transformation object so use getValue() to check key
  if (transformation.getValue) {
    return !!transformation.getValue(key);
  }

  // transformation is an Object so just check for key existence in object
  return !!transformation[key];
};

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
    let isIe = typeof navigator !== 'undefined' && (/MSIE/.test(navigator.userAgent) || /Trident\//.test(navigator.appVersion));
    let srcs = this.sourceTypes().map((sourceType) => {
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

        // If user's transformation include video_codec then don't add another video codec to transformation
        if (codecTrans && !isKeyInTransformation(opts.transformation, 'video_codec')) {
          opts.transformation.push(codecTrans);
        }
      }
      src = `${this.config().url(this.publicId(), opts)}${queryString}`;
      return { type, src, cldSrc: this };
    });
    if (isIe) {
      return srcs.filter(s => s.type !== 'video/mp4; codec="hev1"');
    } else {
      return srcs;
    }
  }
}

const CONTAINER_MIME_TYPES = {
  dash: 'application/dash+xml',
  hls: 'application/x-mpegURL'
};

function formatToMimeTypeAndTransformation(format) {
  let [container, codec] = format.toLowerCase().split('\/');
  let result = CONTAINER_MIME_TYPES[container];
  let transformation = null;

  if (!result) {
    result = [`video/${container}`, transformation];
  }

  if (codec) {
    codec = codecShorthandTrans(codec);
    transformation = codecToSrcTransformation(codec);
    result = [`${result[0]}; codec="${codec}"`, transformation];
  }

  return result;
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
