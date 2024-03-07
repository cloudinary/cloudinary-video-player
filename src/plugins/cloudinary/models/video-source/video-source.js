import { sliceAndUnsetProperties } from 'utils/slicing';
import { assign } from 'utils/assign';
import { objectToQuerystring } from 'utils/querystring';
import { castArray } from 'utils/array';
import { SOURCE_TYPE } from 'utils/consts';
import {
  CONTAINER_MIME_TYPES,
  ADAPTIVE_SOURCETYPES,
  DEFAULT_POSTER_PARAMS,
  DEFAULT_VIDEO_PARAMS,
  VIDEO_SUFFIX_REMOVAL_PATTERN
} from './video-source.const';
import {
  formatToMimeTypeAndTransformation,
  isCodecAlreadyExist,
  normalizeFormat
} from './video-source.utils';
import { normalizeOptions, isSrcEqual, isRawUrl, mergeTransformations } from '../../common';
import BaseSource from '../base-source';
import ImageSource from '../image-source';

let objectId = 0;

const generateId = () => objectId++;

class VideoSource extends BaseSource {
  constructor(_publicId, initOptions = {}) {
    const _isRawUrl = isRawUrl(_publicId);
    let { publicId, options } = normalizeOptions(_publicId, initOptions);

    if (!_isRawUrl) {
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
      interactionAreas,
      chapters
    } = sliceAndUnsetProperties(
      options,
      'poster',
      'sourceTypes',
      'sourceTransformation',
      'info',
      'recommendations',
      'textTracks',
      'withCredentials',
      'interactionAreas',
      'chapters'
    );

    super(publicId, options);

    this._sourceTypes = null;
    this._recommendations = null;
    this._textTracks = null;
    this._poster = null;
    this._info = null;
    this._sourceTransformation = null;
    this._interactionAreas = null;
    this._chapters = null;
    this._type = SOURCE_TYPE.VIDEO;
    this.isRawUrl = _isRawUrl;
    this._rawTransformation = options.raw_transformation;
    this.withCredentials = !!withCredentials;
    this.getInitOptions = () => initOptions;

    this.poster(poster);
    this.sourceTypes(sourceTypes);
    this.sourceTransformation(sourceTransformation);
    this.info(info);
    this.interactionAreas(interactionAreas);
    this.chapters(chapters);
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

  sourceTypes(types) {
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

  chapters(chapters) {
    if (!chapters) {
      return this._chapters;
    }

    this._chapters = chapters;

    return this;
  }

  sourceTransformation(trans) {
    if (!trans) {
      return this._sourceTransformation;
    }

    this._sourceTransformation = trans;

    return this;
  }

  poster(publicId, options = {}) {
    if (!publicId) {
      return this._poster;
    }

    if (publicId instanceof ImageSource) {
      this._poster = publicId;
      return this;
    }

    ({ publicId, options } = normalizeOptions(publicId, options, { tolerateMissingId: true }));

    if (!publicId && this.isRawUrl) {
      return null;
    }

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
    return sources.some(_source => isSrcEqual(_source, source));
  }

  generateSources() {
    if (this.isRawUrl) {
      const type = this.sourceTypes()[0] === 'auto' ? null : this.sourceTypes()[0];
      return [this.generateRawSource(this.publicId(), type)];
    }

    const srcs = this.sourceTypes().map(sourceType => {
      const srcTransformation = this.sourceTransformation()[sourceType] || this.transformation();
      const format = normalizeFormat(sourceType);
      const isAdaptive = ADAPTIVE_SOURCETYPES.includes(format);
      const opts = {};

      if (srcTransformation) {
        opts.transformation = castArray(srcTransformation);
      }

      assign(opts, { resource_type: 'video', format });

      const [type, codecTrans] = formatToMimeTypeAndTransformation(sourceType);

      // If user's transformation include video_codec then don't add another video codec to transformation
      if (codecTrans && !isCodecAlreadyExist(opts.transformation, this._rawTransformation)) {
        opts.transformation = mergeTransformations(opts.transformation, codecTrans);
      }

      if (opts.format === 'auto') {
        delete opts.format;
        opts.transformation = mergeTransformations(opts.transformation, {
          fetch_format: 'auto:video'
        });
      }

      if (isAdaptive) {
        // Search for streaming_profile anywhere in the transformation
        if (!JSON.stringify(opts.transformation || {}).includes('"streaming_profile":')) {
          opts.transformation = mergeTransformations(opts.transformation, {
            streaming_profile: 'auto'
          });
        }
      }

      const queryString = this.queryParams() ? objectToQuerystring(this.queryParams()) : '';

      const src = this.config().url(this.publicId(), opts);
      // if src is a url that already contains query params then replace '?' with '&'
      const params = src.indexOf('?') > -1 ? queryString.replace('?', '&') : queryString;

      return {
        type,
        src: src + params,
        cldSrc: this,
        isAdaptive: isAdaptive,
        withCredentials: this.withCredentials
      };
    });

    return srcs;
  }

  generateRawSource(url, type) {
    type = type || url.split('.').pop();

    const isAdaptive = ADAPTIVE_SOURCETYPES.includes(type);

    if (CONTAINER_MIME_TYPES[type]) {
      type = CONTAINER_MIME_TYPES[type];
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
