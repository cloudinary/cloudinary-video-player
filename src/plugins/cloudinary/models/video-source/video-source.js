import BaseSource from '../base-source';
import ImageSource from '../image-source';
import { normalizeOptions, isSrcEqual } from '../../common';
import { sliceAndUnsetProperties } from 'utils/slicing';
import { assign } from 'utils/assign';
import { objectToQuerystring } from 'utils/querystring';
import { isKeyInTransformation } from 'utils/cloudinary';
import { default as vjs } from 'video.js';
import {
  CONTAINER_MIME_TYPES,
  DEFAULT_POSTER_PARAMS,
  DEFAULT_VIDEO_PARAMS,
  URL_PATTERN,
  VIDEO_SUFFIX_REMOVAL_PATTERN
} from './video-source.const';
import { formatToMimeTypeAndTransformation, normalizeFormat } from './video-source.utils';

let objectId = 0;

const generateId = () => objectId++;

class VideoSource extends BaseSource {

  constructor(_publicId, initOptions = {}) {

    const isRawUrl = URL_PATTERN.test(_publicId);
    let { publicId, options } = normalizeOptions(_publicId, initOptions);

    if (!isRawUrl) {
      publicId = publicId.replace(VIDEO_SUFFIX_REMOVAL_PATTERN, '');
    }

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
      textTracks,
      withCredentials,
      interactionAreas
    } = sliceAndUnsetProperties(
      options,
      'poster',
      'sourceTypes',
      'sourceTransformation',
      'info',
      'recommendations',
      'textTracks',
      'withCredentials',
      'interactionAreas'
    );

    super(publicId, options);

    this._sourceTypes = null;
    this._recommendations = null;
    this._textTracks = null;
    this._poster = null;
    this._info = null;
    this._sourceTransformation = null;
    this._interactionAreas = null;
    this._type = 'VideoSource';
    this.isRawUrl = isRawUrl;
    this.withCredentials = !!withCredentials;
    this.getInitOptions = () => initOptions;

    this.poster(poster);
    this.sourceTypes(sourceTypes);
    this.sourceTransformation(sourceTransformation);
    this.info(info);
    this.interactionAreas(interactionAreas);
    this.recommendations(recommendations);
    this.textTracks(textTracks);
    this.objectId = generateId();
  }

  textTracks(textTracks) {
    if (textTracks === undefined) {
      return this._textTracks;
    }

    this._textTracks = textTracks;

    return this;
  }

  recommendations(recommends) {
    if (recommends === undefined) {
      return this._recommendations;
    }

    this._recommendations = recommends;

    return this;
  }

  sourceTypes (types) {
    if (!types) {
      return this._sourceTypes;
    }
    this._sourceTypes = types;

    return this;
  }

  info(info) {
    if (!info) {
      return this._info;
    }

    this._info = info;

    return this;
  }

  interactionAreas(interactionAreas) {
    if (!interactionAreas) {
      return this._interactionAreas;
    }

    this._interactionAreas = interactionAreas;

    return this;
  }

  sourceTransformation(trans) {
    if (!trans) {
      return this._sourceTransformation;
    }

    this._sourceTransformation = trans;

    return this;
  }

  poster (publicId, options = {}) {
    if (!publicId) {
      return this._poster;
    }

    if (publicId instanceof ImageSource) {
      this._poster = publicId;
      return this;
    }

    ({ publicId, options } = normalizeOptions(publicId, options, { tolerateMissingId: true }));

    if (!publicId) {
      publicId = this.publicId();
      options = assign({}, options, DEFAULT_POSTER_PARAMS);
    }

    options.cloudinaryConfig = options.cloudinaryConfig || this.cloudinaryConfig();
    this._poster = new ImageSource(publicId, options);

    return this;
  }

  contains(source) {
    const sources = this.generateSources();
    return sources.some((_source) => isSrcEqual(_source, source));
  }

  generateSources() {
    if (this.isRawUrl) {
      let type = this.sourceTypes().length > 1 ? null : this.sourceTypes()[0];
      return [this.generateRawSource(this.publicId(), type)];
    }
    let isIe = typeof navigator !== 'undefined' && (/MSIE/.test(navigator.userAgent) || /Trident\//.test(navigator.appVersion));
    let srcs = this.sourceTypes().map((sourceType) => {
      const srcTransformation = this.sourceTransformation()[sourceType] || this.transformation();
      const format = normalizeFormat(sourceType);
      const isAdaptive = (['mpd', 'm3u8'].indexOf(format) !== -1);
      const opts = {};

      if (srcTransformation) {
        opts.transformation = Array.isArray(srcTransformation) ? srcTransformation : [srcTransformation];
      }

      assign(opts, { resource_type: 'video', format });

      const hasCodecSrcTrans = (isKeyInTransformation(opts.transformation, 'video_codec') || isKeyInTransformation(opts.transformation, 'streaming_profile'));
      const [type, codecTrans] = formatToMimeTypeAndTransformation(sourceType);
      // If user's transformation include video_codec then don't add another video codec to transformation
      if (codecTrans && !hasCodecSrcTrans) {
        opts.transformation.push(codecTrans);
      }
      if (opts.format === 'auto') {
        delete opts.format;
      }

      let queryString = this.queryParams() ? objectToQuerystring(this.queryParams()) : '';

      let src = this.config().url(this.publicId(), opts);
      // if src is a url that already contains query params then replace '?' with '&'
      src += src.indexOf('?') > -1 ? queryString.replace('?', '&') : queryString;

      return { type, src, cldSrc: this, isAdaptive: isAdaptive, withCredentials: this.withCredentials };
    });

    if (isIe) {
      return srcs.filter(s => s.type !== 'video/mp4; codec="hev1.1.6.L93.B0"');
    } else if (vjs.browser.IS_ANY_SAFARI) {
      // filter out dash on safari
      return srcs.filter(s => s.type.indexOf('application/dash+xml') === -1);
    } else {
      return srcs;
    }
  }

  generateRawSource(url, type) {
    const t = type || url.split('.').pop();
    const isAdaptive = !!CONTAINER_MIME_TYPES[t];
    if (isAdaptive) {
      type = CONTAINER_MIME_TYPES[t][0];
    } else {
      type = type ? `video/${type}` : null;
    }

    return { type, src: url, cldSrc: this, isAdaptive, withCredentials: this.withCredentials };
  }

  getInteractionAreas() {
    return this._interactionAreas;
  }
}

export default VideoSource;
