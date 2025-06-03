import isFunction from 'lodash/isFunction';
import { applyWithProps } from 'utils/apply-with-props';
import { sliceAndUnsetProperties } from 'utils/slicing';
import { isKeyInTransformation } from 'utils/cloudinary';
import {
  normalizeOptions,
  mergeTransformations,
  extendCloudinaryConfig,
  setupCloudinaryMiddleware
} from './common';
import VideoSource from './models/video-source/video-source';
import EventHandlerRegistry from './event-handler-registry';
import AudioSource from './models/audio-source/audio-source';

import recommendationsOverlay from 'components/recommendations-overlay';

const DEFAULT_PARAMS = {
  transformation: {},
  sourceTypes: [],
  sourceTransformation: [],
  posterOptions: {}
};

export const CONSTRUCTOR_PARAMS = ['cloudinaryConfig', 'transformation',
  'sourceTypes', 'sourceTransformation', 'posterOptions', 'autoShowRecommendations'];

class CloudinaryContext {
  constructor(player, options = {}) {
    setupCloudinaryMiddleware();

    this.player = player;
    options = Object.assign({}, DEFAULT_PARAMS, options);

    let _source = null;
    let _sources = null;
    let _lastSource = null;
    let _lastPlaylist = null;
    let _posterOptions = null;
    let _cloudinaryConfig = null;
    let _transformation = null;
    let _sourceTypes = null;
    let _sourceTransformation = null;
    let _chainTarget = options.chainTarget;
    let _playerEvents = null;
    let _recommendations = null;
    let _autoShowRecommendations = false;

    this.source = (source, options = {}) => {
      options = Object.assign({}, options);

      if (!source) {
        return _source;
      }

      let src = null;

      if (source instanceof VideoSource) {
        src = source;
      } else {
        let { publicId, options: _options } = normalizeOptions(source, options);
        src = this.buildSource(publicId, _options);
      }

      const recommendations = src.recommendations();
      if (recommendations && recommendations.length) {

        let itemBuilder = null;
        let disableAutoShow = false;

        if (options.recommendationOptions) {
          ({ disableAutoShow, itemBuilder } = sliceAndUnsetProperties(options.recommendationOptions, 'disableAutoShow', 'itemBuilder'));
        }

        recommendationsOverlay(player).then(() => {
          setRecommendations(recommendations, { disableAutoShow, itemBuilder });
        });

      } else {
        unsetRecommendations();
      }

      _source = src;

      const isDash = 
        (options.sourceTypes && options.sourceTypes.some(s => s.includes('dash'))) ||
        (typeof source === 'string' && source.endsWith('.mpd'));
      const isHls = 
        (options.sourceTypes && options.sourceTypes.some(s => s.includes('hls'))) ||
        (typeof source === 'string' && source.endsWith('.m3u8'));
      const isAdaptiveStreamingRequired = isDash || isHls;
      
      if (isAdaptiveStreamingRequired && !this.player.adaptiveStreamingLoaded) {
        import(/* webpackChunkName: "adaptive-streaming" */ '../adaptive-streaming')
          .then(() => {
            this.player.adaptiveStreaming({
              ...options.adaptiveStreaming,
              isDash,
              debug: options.debug
            }).then(() => {
              refresh();
            });
          })
          .catch(err => {
            console.error('Failed to load adaptive streaming plugin:', err);
            refresh();
          });
      } else if (!options.skipRefresh) {
        refresh();
      }

      this.player.trigger('cldsourcechanged', { source: src, sourceOptions: options });

      return _chainTarget;
    };

    this.buildSource = (publicId, options = {}) => {
      let builtSrc = null;
      ({ publicId, options } = normalizeOptions(publicId, options));

      options.cloudinaryConfig = extendCloudinaryConfig(this.cloudinaryConfig(), options.cloudinaryConfig || {});
      options.transformation = mergeTransformations(this.transformation(), options.transformation || {});
      options.sourceTransformation = options.sourceTransformation || this.sourceTransformation();
      options.sourceTypes = options.sourceTypes || this.sourceTypes();
      options.poster = options.poster || posterOptionsForCurrent();
      options.queryParams = Object.assign(options.queryParams || {}, options.allowUsageReport ? { _s: `vp-${VERSION}` } : {});

      if (options.sourceTypes.indexOf('audio') > -1) {
        builtSrc = new AudioSource(publicId, options);
      } else {
        builtSrc = new VideoSource(publicId, options);
      }

      return builtSrc;
    };

    this.posterOptions = (options) => {
      if (!options) {
        return _posterOptions;
      }

      _posterOptions = options;

      return _chainTarget;
    };

    this.disablePoster = (posterColor) => {
      // https://docs.videojs.com/player.js.html#line3816
      this.player.poster(' ');
      this.player.posterImage.el().style.backgroundColor = posterColor;
    };

    this.cloudinaryConfig = (config) => {
      if (!config) {
        return _cloudinaryConfig;
      }

      _cloudinaryConfig = config;

      return _chainTarget;
    };

    this.transformation = (trans) => {
      if (!trans) {
        return _transformation;
      }

      _transformation = trans;

      return _chainTarget;
    };

    this.sourceTypes = (types) => {
      if (!types) {
        return _sourceTypes;
      }

      _sourceTypes = types;

      return _chainTarget;
    };

    this.getCurrentSources = () => _sources;

    this.sourceTransformation = (trans) => {
      if (!trans) {
        return _sourceTransformation;
      }

      _sourceTransformation = trans;

      return _chainTarget;
    };

    this.on = (...args) => _playerEvents.on(...args);
    this.one = (...args) => _playerEvents.one(...args);
    this.off = (...args) => _playerEvents.off(...args);

    this.autoShowRecommendations = (autoShow) => {
      if (autoShow === undefined) {
        return _autoShowRecommendations;
      }

      _autoShowRecommendations = autoShow;

      return _chainTarget;
    };

    this.dispose = () => {
      if (this.playlist && this.playlist()) {
        this.disposePlaylist();
      }
      unsetRecommendations();
      _source = undefined;
      _playerEvents.removeAllListeners();
    };

    const setRecommendations = (recommendations, { disableAutoShow = false, itemBuilder = null }) => {
      unsetRecommendations();

      if (!Array.isArray(recommendations) && typeof recommendations !== 'function' && !recommendations.then) {
        throw new Error('"recommendations" must be either an array or a function');
      }

      _recommendations = {};

      itemBuilder = itemBuilder || ((source) => ({ source: source instanceof VideoSource ? source : this.buildSource(source), action: () => this.source(source) }));

      _recommendations.sourceChangedHandler = () => {
        const trigger = (sources) => {
          if (typeof sources !== 'undefined' && sources.length > 0) {
            const items = sources.map((_source) => itemBuilder(_source));
            this.player.trigger('recommendationschanged', { items });
          } else {
            this.player.trigger('recommendationsnoshow');
          }
          _recommendations.sources = sources;
        };

        if (isFunction(recommendations)) {
          trigger(recommendations());
        } else if (recommendations.then) {
          recommendations.then(trigger);
        } else {
          trigger(recommendations);
        }
      };

      _recommendations.sourceChangedHandler();

      _recommendations.endedHandler = () => {
        if (!disableAutoShow && this.autoShowRecommendations()) {
          this.player.trigger('recommendationsshow');
        }
      };

      this.on('ended', _recommendations.endedHandler);
    };

    const unsetRecommendations = () => {
      if (_recommendations) {
        this.off('cldsourcechanged', _recommendations.sourceChangedHandler);
        this.off('ended', _recommendations.endedHandler);
        delete _recommendations.endedHandler;
        delete _recommendations.sourceChangedHandler;
      }

      _recommendations = null;
    };

    const refresh = () => {
      const src = this.source();
      const posterOptions = Object.assign({}, this.player.cloudinary.posterOptions(), src.getInitOptions().poster);

      if (posterOptions.posterColor) {
        this.disablePoster(posterOptions.posterColor);
      } else if (src.poster()) {
        this.player.poster(src.poster().url());
      }

      _sources = src.generateSources().reduce((srcs, src) => {
        if (src.isAdaptive) {
          let codec = src.type.split('; ')[1] || null;
          if (codec && 'MediaSource' in window) {
            const parts = src.type.split('; ');
            let typeStr = `video/mp4; ${parts[1] || ''}`;
            const canPlay = testCanPlayTypeAndTypeSupported(typeStr);
            if (canPlay) {
              srcs.push(src);
            }
          } else {
            srcs.push(src);
          }
        } else {
          srcs.push(src);
        }
        return srcs;
      }, []);
      this.player.src(_sources);

      _lastSource = src;
      if (this.playlist) {
        _lastPlaylist = this.playlist();
      }
    };
    const testCanPlayTypeAndTypeSupported = (codec) => {
      const v = document.createElement('video');
      return v.canPlayType(codec) || 'MediaSource' in window && MediaSource.isTypeSupported(codec);
    };

    const posterOptionsForCurrent = () => {
      const opts = Object.assign({}, this.posterOptions());

      opts.transformation = opts.transformation || {};

      if ((opts.transformation.width || opts.transformation.height) && !opts.transformation.crop) {
        opts.transformation.crop = 'scale';
      }

      // Set poster dimensions to player actual size.
      // (unless they were explicitly set via `posterOptions`)
      const playerEl = this.player.el();
      if (playerEl && playerEl.clientWidth && playerEl.clientHeight && !isKeyInTransformation(opts.transformation, 'width') && !isKeyInTransformation(opts.transformation, 'height')) {
        const roundUp100 = (val) => 100 * Math.ceil(val / 100);

        opts.transformation = mergeTransformations(opts.transformation, {
          width: roundUp100(playerEl.clientWidth),
          height: roundUp100(playerEl.clientHeight),
          crop: 'limit'
        });
      }

      return opts;
    };

    // Handle external (non-cloudinary plugin) source changes (e.g. by ad plugins)
    const syncState = (_, data) => {
      let src = data.to;

      // When source is cloudinary's
      if (_lastSource && _lastSource.contains(src)) {
        // If plugin state doesn't have an active VideoSource
        if (!this.source()) {
          // We might have been running a playlist, reset playlist's state.
          if (this.playlist && _lastPlaylist) {
            this.playlist(_lastPlaylist);
          }
          // Rebuild last source state without calling vjs's 'src' and 'poster'
          this.source(_lastSource, { skipRefresh: true });
        }
      } else {
        // Used by cloudinary-only components
        this.player.trigger('cldsourcechanged', {});

        // When source isn't cloudinary's - reset the plugin's state.
        this.dispose();
      }
    };

    _playerEvents = new EventHandlerRegistry(this.player);

    const constructorParams = sliceAndUnsetProperties(options, ...CONSTRUCTOR_PARAMS);

    applyWithProps(this, constructorParams);

    this.on('sourcechanged', syncState);
  }

  currentSourceType() {
    return this.source().getType();
  }

  currentPublicId() {
    return this.source() && this.source().publicId();
  }

  currentPoster() {
    return this.source() && this.source().poster();
  }
}

export default function (options = {}) {
  options.chainTarget = options.chainTarget || this;
  this.cloudinary = new CloudinaryContext(this, options);
}
