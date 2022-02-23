import { default as vjs } from 'video.js';
import { mixin } from 'utils/mixin';
import { applyWithProps } from 'utils/apply-with-props';
import { sliceAndUnsetProperties } from 'utils/slicing';
import { isKeyInTransformation } from 'utils/cloudinary';
import { assign } from 'utils/assign';
import {
  normalizeOptions,
  mergeTransformations,
  codecShorthandTrans,
  extendCloudinaryConfig
} from './common';
import Playlistable from 'mixins/playlistable';
import VideoSource from './models/video-source/video-source';
import EventHandlerRegistry from './event-handler-registry';
import AudioSource from './models/audio-source/audio-source';
import { isFunction } from '../../utils/type-inference';

const DEFAULT_PARAMS = {
  transformation: {},
  sourceTypes: [],
  sourceTransformation: [],
  posterOptions: {}
};

export const CONSTRUCTOR_PARAMS = ['cloudinaryConfig', 'transformation',
  'sourceTypes', 'sourceTransformation', 'posterOptions', 'autoShowRecommendations'];

class CloudinaryContext extends mixin(Playlistable) {

  constructor(player, options = {}) {
    super(player, options);

    this.player = player;
    options = assign({}, DEFAULT_PARAMS, options);

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
      options = assign({}, options);

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

      if (src.recommendations()) {
        const recommendations = src.recommendations();

        let itemBuilder = null;
        let disableAutoShow = false;

        if (options.recommendationOptions) {
          ({ disableAutoShow, itemBuilder } = sliceAndUnsetProperties(options.recommendationOptions, 'disableAutoShow', 'itemBuilder'));
        }
        setRecommendations(recommendations, { disableAutoShow, itemBuilder });
      } else {
        unsetRecommendations();
      }

      _source = src;
      if (!options.skipRefresh) {
        refresh();
      }
      this.player.trigger('cldsourcechanged', { source: src });

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
      options.queryParams = Object.assign(options.queryParams || {}, options.usageReport ? { _s: `vp-${VERSION}` } : {});

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
      if (this.playlist()) {
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

      this.one('cldsourcechanged', _recommendations.sourceChangedHandler);

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
      if (src.poster()) {
        this.player.poster(src.poster().url());
      }

      _sources = src.generateSources().reduce((srcs, src) => {
        if (src.isAdaptive) {
          let codec = src.type.split('; ')[1] || null;
          if (codec && 'MediaSource' in window) {
            const parts = src.type.split('; ');
            let typeStr = `video/mp4; ${parts[1] || ''}`;
            const canPlay = testCanPlayTypeAndTypeSupported(typeStr);
            if (vjs.browser.IS_ANY_SAFARI) {
              // work around safari saying it cant play h265
              src.type = `${parts[0]}; ${codecShorthandTrans('h264')}`;
            }
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
      _lastPlaylist = this.playlist();
    };
    const testCanPlayTypeAndTypeSupported = (codec) => {
      const v = document.createElement('video');
      return v.canPlayType(codec) || 'MediaSource' in window && MediaSource.isTypeSupported(codec);
    };

    const posterOptionsForCurrent = () => {
      const opts = assign({}, this.posterOptions());
      if (opts.transformation) {
        if ((opts.transformation.width || opts.transformation.height) && !opts.transformation.crop) {
          opts.transformation.crop = 'scale';
        }
      }

      opts.transformation = opts.transformation || {};

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
          if (_lastPlaylist) {
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

export default function(options = {}) {
  options.chainTarget = options.chainTarget || this;
  this.cloudinary = new CloudinaryContext(this, options);
}
