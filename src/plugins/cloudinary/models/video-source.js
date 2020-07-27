import BaseSource from './base-source';
import ImageSource from './image-source';
import { normalizeOptions, isSrcEqual, codecShorthandTrans, codecToSrcTransformation } from '../common';
import { sliceAndUnsetProperties } from 'utils/slicing';
import { assign } from 'utils/assign';
import { objectToQuerystring } from 'utils/querystring';
import { isKeyInTransformation } from 'utils/cloudinary';

if (!Array.prototype.find) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this === null) {
        // eslint-disable-next-line new-cap
        throw TypeError('"this" is null or not defined');
      }

      let o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      // eslint-disable-next-line no-bitwise
      let len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        // eslint-disable-next-line new-cap
        throw TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      // eslint-disable-next-line prefer-rest-params
      let thisArg = arguments[1];

      // 5. Let k be 0.
      let k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        let kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    },
    configurable: true,
    writable: true
  });
}
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

    const {
      poster,
      sourceTypes,
      sourceTransformation,
      info,
      recommendations,
      textTracks
    } = sliceAndUnsetProperties(
      options,
      'poster',
      'sourceTypes',
      'sourceTransformation',
      'info',
      'recommendations',
      'textTracks'
    );

    super(publicId, options);

    let _poster = null;
    let _sourceTypes = null;
    let _sourceTransformation = null;
    let _info = null;
    let _recommendations = null;
    let _textTracks = null;
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

    this.textTracks = (textTracks) => {
      if (textTracks === undefined) {
        return _textTracks;
      }

      _textTracks = textTracks;

      return this;
    };

    this.poster(poster);
    this.sourceTypes(sourceTypes);
    this.sourceTransformation(sourceTransformation);
    this.info(info);
    this.recommendations(recommendations);
    this.textTracks(textTracks);
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
      const srcTransformation = this.sourceTransformation()[sourceType] || this.transformation();
      const format = normalizeFormat(sourceType);
      let isAdaptive = (['mpd', 'm3u8'].indexOf(format) !== -1);
      const opts = {};
      if (srcTransformation) {
        opts.transformation = Array.isArray(srcTransformation) ? srcTransformation : [srcTransformation];
      }
      assign(opts, { resource_type: 'video', format });

      let type = null;
      let codecTrans = null;
      let hasCodecSrcTrans = (isKeyInTransformation(opts.transformation, 'video_codec') || isKeyInTransformation(opts.transformation, 'streaming_profile'));
      [type, codecTrans] = formatToMimeTypeAndTransformation(sourceType);
      // If user's transformation include video_codec then don't add another video codec to transformation
      if (codecTrans && !hasCodecSrcTrans) {
        opts.transformation.push(codecTrans);
      }
      if (opts.format === 'auto') {
        delete opts.format;
      }

      let queryString = this.queryParams() ? objectToQuerystring(this.queryParams()) : '';

      src = this.config().url(this.publicId(), opts);
      // if src is a url that already contains query params then replace '?' with '&'
      src += src.indexOf('?') > -1 ? queryString.replace('?', '&') : queryString;

      return { type, src, cldSrc: this, isAdaptive: isAdaptive };
    });
    if (isIe) {
      return srcs.filter(s => s.type !== 'video/mp4; codec="hev1.1.6.L93.B0"');
    } else {
      return srcs;
    }
  }
}

const CONTAINER_MIME_TYPES = {
  dash: ['application/dash+xml'],
  hls: ['application/x-mpegURL']
};

function formatToMimeTypeAndTransformation(format) {
  let [container, codec] = format.toLowerCase().split('\/');
  let result = CONTAINER_MIME_TYPES[container];
  let transformation = null;

  if (!result) {
    result = [`video/${container}`, transformation];
  }

  if (codec) {
    transformation = codecToSrcTransformation(codec);
    result = [`${result[0]}; codecs="${codecShorthandTrans(codec)}"`, transformation];
  }
  return result;
}

const FORMAT_MAPPINGS = {
  hls: 'm3u8',
  dash: 'mpd'
};

function normalizeFormat(format) {
  format = format.toLowerCase().split('\/').shift();

  let res = FORMAT_MAPPINGS[format];
  if (!res) {
    res = format.split('\/').shift();
  }

  return res;
}
export default VideoSource;
