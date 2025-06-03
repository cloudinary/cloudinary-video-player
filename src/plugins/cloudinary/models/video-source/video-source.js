import { objectToQuerystring } from 'utils/querystring';
import castArray from 'lodash/castArray';
import { SOURCE_TYPE } from 'utils/consts';
import { SOURCE_PARAMS } from 'video-player.const';
import {
  CONTAINER_MIME_TYPES,
  ADAPTIVE_SOURCETYPES,
  DEFAULT_POSTER_PARAMS,
  DEFAULT_VIDEO_PARAMS,
  VIDEO_SUFFIX_REMOVAL_PATTERN
} from './video-source.const';
import {
  formatToMimeTypeAndTransformation,
  hasCodec,
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

    options = Object.assign({}, DEFAULT_VIDEO_PARAMS, options);

    if (!options.poster) {
      options.poster = Object.assign({ publicId }, DEFAULT_POSTER_PARAMS);
    }

    super(publicId, options);

    this._type = SOURCE_TYPE.VIDEO;
    this.isRawUrl = _isRawUrl;
    this.isLiveStream = options.type === 'live';
    this.withCredentials = !!options.withCredentials;
    this.getInitOptions = () => initOptions;

    // Set extracted parameters using their respective methods
    SOURCE_PARAMS.forEach(param => {
      if (options[param] !== undefined && typeof this[param] === 'function') {
        this[param](options[param]);
      }
    });
    
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

  visualSearch(visualSearch) {
    if (!visualSearch) {
      return this._visualSearch;
    }

    this._visualSearch = visualSearch;

    return this;
  }

  sourceTransformation(trans) {
    if (!trans) {
      return this._sourceTransformation;
    }

    this._sourceTransformation = trans;

    return this;
  }

  poster(publicId) {
    let options = { type: this.getInitOptions().type };

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

    if (this.isLiveStream) {
      return null;
    }

    if (!publicId) {
      publicId = this.publicId();
      options = Object.assign({}, options, DEFAULT_POSTER_PARAMS);
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

      Object.assign(opts, { resource_type: 'video', format });

      const [type, codecTrans] = formatToMimeTypeAndTransformation(sourceType);

      // If user's transformation include video_codec then don't add another video codec to transformation
      if (codecTrans && !(hasCodec(opts.transformation) || hasCodec(this.raw_transformation()))) {
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
        const hasStreamingProfile = JSON.stringify(opts.transformation || {}).includes('"streaming_profile":');
        if (!hasStreamingProfile && !this.isLiveStream) {
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

  // Methods for additional SOURCE_PARAMS
  adaptiveStreaming(value) {
    if (value === undefined) {
      return this._adaptiveStreaming;
    }
    this._adaptiveStreaming = value;
    return this;
  }

  allowUsageReport(value) {
    if (value === undefined) {
      return this._allowUsageReport;
    }
    this._allowUsageReport = value;
    return this;
  }

  autoShowRecommendations(value) {
    if (value === undefined) {
      return this._autoShowRecommendations;
    }
    this._autoShowRecommendations = value;
    return this;
  }

  queryParams(params) {
    if (params === undefined) {
      return this._queryParams;
    }
    this._queryParams = params;
    return this;
  }

  raw_transformation(value) {
    if (value === undefined) {
      return this._raw_transformation;
    }
    this._raw_transformation = value;
    return this;
  }

  shoppable(value) {
    if (value === undefined) {
      return this._shoppable;
    }
    this._shoppable = value;
    return this;
  }

  // Additional setter methods for remaining SOURCE_PARAMS
  source(value) {
    if (value === undefined) {
      return this._source;
    }
    this._source = value;
    return this;
  }

  transformation(value) {
    if (value === undefined) {
      return this._transformation;
    }
    this._transformation = value;
    return this;
  }

  cloudinaryConfig(value) {
    if (value === undefined) {
      return this._cloudinaryConfig;
    }
    this._cloudinaryConfig = value;
    return this;
  }

  type(value) {
    if (value === undefined) {
      return this._typeValue;
    }
    this._typeValue = value;
    return this;
  }

  posterOptions(value) {
    if (value === undefined) {
      return this._posterOptions;
    }
    this._posterOptions = value;
    return this;
  }
}

export default VideoSource;
