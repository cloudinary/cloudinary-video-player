import { appendQueryParams } from 'utils/querystring';
import castArray from 'lodash/castArray';
import { SOURCE_TYPE } from 'utils/consts';
import { SOURCE_PARAMS } from 'video-player.const';
import {
  CONTAINER_MIME_TYPES,
  ADAPTIVE_SOURCETYPES,
  DEFAULT_POSTER_PARAMS,
  DEFAULT_VIDEO_PARAMS,
  VIDEO_SUFFIX_REMOVAL_PATTERN,
  BREAKPOINT_RENDITIONS,
  BREAKPOINT_DEFAULT_MAX_DPR
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
import {
  calculateBreakpoint,
  getContainerElement,
  normalizeDpr
} from './video-source.breakpoints';

let objectId = 0;

const generateId = () => objectId++;

/**
 * Calculate effective DPR based on device and user-specified maximum
 * @private
 * @param {number} maxDpr - Maximum DPR cap specified by user
 * @returns {number} Effective DPR (capped and normalized)
 */
const calculateEffectiveDpr = (maxDpr) => {
  // Get device DPR (default to 1.0 if not available, e.g., SSR)
  const deviceDpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1.0;
  
  // Calculate effective DPR: Math.min(deviceDpr, maxDpr, 2.0)
  const effectiveDpr = Math.min(deviceDpr, maxDpr, 2.0);
  
  return effectiveDpr;
};

/**
 * Normalize and validate breakpoint configuration
 * @private
 * @param {boolean} breakpointsEnabled - Whether breakpoints are enabled
 * @param {number} maxDpr - Maximum DPR cap (user-specified)
 * @returns {Object|null} Normalized config or null if disabled/invalid
 */
const normalizeBreakpointConfig = (breakpointsEnabled, maxDpr) => {
  // If breakpoints not enabled, return null
  if (!breakpointsEnabled) return null;

  // Use provided maxDpr or default
  const maxDprValue = maxDpr !== undefined ? maxDpr : BREAKPOINT_DEFAULT_MAX_DPR;

  // Validate maxDpr
  if (typeof maxDprValue !== 'number' || isNaN(maxDprValue) || maxDprValue < 1.0) {
    console.warn('Invalid DPR value:', maxDprValue, '- using default:', BREAKPOINT_DEFAULT_MAX_DPR);
    const effectiveDpr = calculateEffectiveDpr(BREAKPOINT_DEFAULT_MAX_DPR);
    return {
      renditions: BREAKPOINT_RENDITIONS,
      dpr: normalizeDpr(effectiveDpr)
    };
  }

  // Calculate effective DPR based on device and user's max
  const effectiveDpr = calculateEffectiveDpr(maxDprValue);

  // Return normalized config
  return {
    renditions: BREAKPOINT_RENDITIONS,
    dpr: normalizeDpr(effectiveDpr)
  };
};

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

    // Normalize breakpoints configuration (flat structure: breakpoints + dpr)
    options._breakpointsConfig = normalizeBreakpointConfig(options.breakpoints, options.dpr);

    if (options.poster === undefined) {
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
      'poster',             // Has complex logic
      'withCredentials',    // Direct property
      'publicId',           // BaseSource method
      'cloudinaryConfig',   // BaseSource method
      'transformation',     // BaseSource method
      'queryParams',        // BaseSource method
      'type',               // BaseSource handles getType()
      'info',               // Custom override method
      'breakpoints',        // Custom handling below
      'dpr',                // Custom handling below
      '_breakpointsConfig'  // Internal property
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

    // Initialize breakpoints and dpr with flat structure
    this._breakpointsEnabled = !!options.breakpoints;
    this._maxDpr = options.dpr !== undefined ? options.dpr : BREAKPOINT_DEFAULT_MAX_DPR;
    this._breakpointsConfig = options._breakpointsConfig;

    // Breakpoints getter/setter (boolean)
    this.breakpoints = function(value) {
      if (value === undefined) {
        return this._breakpointsEnabled;
      }
      this._breakpointsEnabled = !!value;
      this._breakpointsConfig = normalizeBreakpointConfig(this._breakpointsEnabled, this._maxDpr);
      return this;
    };

    // DPR getter/setter (number) - this is the maximum DPR cap
    this.dpr = function(value) {
      if (value === undefined) {
        return this._maxDpr;
      }
      this._maxDpr = value;
      this._breakpointsConfig = normalizeBreakpointConfig(this._breakpointsEnabled, this._maxDpr);
      return this;
    };

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
    options.resource_type = this.resourceType() || options.resource_type;
    options.queryParams = this.queryParams();

    if (publicId === true) {
      const urlPrefix = getCloudinaryUrlPrefix(options.cloudinaryConfig);
      const deliveryType = this.getInitOptions().type || 'upload';
      const base64PublicId = utf8ToBase64(this.publicId());
      let appletUrl = `${urlPrefix}/_applet_/video_service/elements/${deliveryType}/${base64PublicId}/poster`;

      const transformation = this.getInitOptions().posterOptions?.transformation;
      if (transformation) {
        const transformationString = new Transformation(transformation).toString();
        appletUrl += `?tx=${transformationString}`;
      }

      this._poster = new ImageSource(appletUrl, {
        cloudinaryConfig: options.cloudinaryConfig,
        queryParams: options.queryParams
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

  /**
   * Calculate and return breakpoint transformation based on container width and DPR
   * @param {HTMLElement} playerElement - Video player element
   * @returns {Object|null} Transformation object or null if disabled/unavailable
   */
  getBreakpointTransformation(playerElement) {
    const config = this._breakpointsConfig;
    if (!config) return null;
    
    const container = getContainerElement(playerElement);
    if (!container?.clientWidth) return null;
    
    const { width } = calculateBreakpoint({
      containerWidth: container.clientWidth,
      dpr: config.dpr,
      renditions: config.renditions
    });
    
    return {
      width,
      crop: 'limit'  // Don't upscale beyond source dimensions
    };
  }

  generateSources(playerElement = null) {
    if (this.isRawUrl) {
      const type = this.sourceTypes()[0] === 'auto' ? null : this.sourceTypes()[0];
      return [this.generateRawSource(this.publicId(), type)];
    }

    // Get breakpoint transformation if enabled
    const breakpointTransformation = this._breakpointsConfig && playerElement
      ? this.getBreakpointTransformation(playerElement)
      : null;

    const srcs = this.sourceTypes().map(sourceType => {
      const srcTransformation = this.sourceTransformation()[sourceType] || this.transformation();
      const format = normalizeFormat(sourceType);
      const isAdaptive = ADAPTIVE_SOURCETYPES.includes(format);
      const opts = {};

      if (srcTransformation) {
        opts.transformation = castArray(srcTransformation);
      }

      // Merge breakpoint transformation if available
      if (breakpointTransformation) {
        opts.transformation = mergeTransformations(opts.transformation, breakpointTransformation);
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

      const src = appendQueryParams(this.config().url(this.publicId(), opts), this.queryParams());

      return {
        type,
        src,
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
