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
import { normalizeOptions, isSrcEqual, isRawUrl, mergeTransformations, getCloudinaryUrlPrefix } from '../../common';
import { utf8ToBase64 } from 'utils/utf8Base64';
import Transformation from '@cloudinary/url-gen/backwards/transformation';
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

    if (options.resourceType) {
      options.resource_type = options.resourceType;
    }

    if (!options.poster) {
      options.poster = Object.assign({ publicId }, DEFAULT_POSTER_PARAMS);
    }

    super(publicId, options);

    this._type = SOURCE_TYPE.VIDEO;
    this.isRawUrl = _isRawUrl;
    this.isLiveStream = options.type === 'live';
    this.withCredentials = !!options.withCredentials;
    this.getInitOptions = () => initOptions;

    // Get properties that need simple getter/setter methods (exclude special cases)
    const EXCLUDED_PROPERTIES = [
      'poster',           // Has complex logic
      'withCredentials',  // Direct property
      'publicId',         // BaseSource method
      'cloudinaryConfig', // BaseSource method
      'transformation',   // BaseSource method
      'queryParams',      // BaseSource method
      'type',             // BaseSource handles getType()
      'info'              // Custom override method
    ];
    const SIMPLE_PROPERTIES = SOURCE_PARAMS.filter(param => !EXCLUDED_PROPERTIES.includes(param));

    // Create simple getter/setter methods
    this._createGetterSetters(SIMPLE_PROPERTIES);

    // Set initial values from options
    SIMPLE_PROPERTIES.forEach(prop => {
      if (options[prop] !== undefined) {
        this[prop](options[prop]);
      }
    });

    // Initialize poster
    this.poster(options.poster);

    this.objectId = generateId();
  }

  // Helper method to create simple getter/setter methods
  _createGetterSetters(properties) {
    properties.forEach(prop => {
      const privateKey = `_${prop}`;
      this[prop] = function (value) {
        if (value === undefined) {
          // Provide sensible defaults for specific properties
          if (prop === 'sourceTypes' && this[privateKey] === undefined) {
            return ['auto'];
          }
          if (prop === 'sourceTransformation' && this[privateKey] === undefined) {
            return {};
          }
          return this[privateKey];
        }
        this[privateKey] = value;
        return this;
      };
    });
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

    if (publicId === true) {
      const urlPrefix = getCloudinaryUrlPrefix(options.cloudinaryConfig);
      const deliveryType = this.getInitOptions().type || 'upload';
      const base64PublicId = utf8ToBase64(this.publicId());
      let appletUrl = `${urlPrefix}/_applet_/video_service/elements/${deliveryType}/${base64PublicId}/poster`;

      const transformation = this.getInitOptions().posterOptions?.transformation;
      if (transformation) {
        const transformationString = new Transformation(transformation).toString();
        appletUrl += `?${transformationString}`;
      }

      this._poster = new ImageSource(appletUrl, {
        cloudinaryConfig: options.cloudinaryConfig
      });

      return this;
    }

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

      Object.assign(opts, { format });

      const [type, codecTrans] = formatToMimeTypeAndTransformation(sourceType);

      // If user's transformation include video_codec then don't add another video codec to transformation
      if (codecTrans && !(hasCodec(opts.transformation) || hasCodec(this.rawTransformation()))) {
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

  info(value) {
    if (value !== undefined) {
      this._info = value;
      return this;
    }

    const info = this._info || this.getInitOptions().info;

    return {
      title: this.title() || info?.title || '',
      subtitle: this.description() || info?.subtitle || '',
      description: this.description() || info?.subtitle || '',
    };
  }
}

export default VideoSource;
