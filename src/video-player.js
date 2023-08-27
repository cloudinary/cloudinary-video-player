import videojs from 'video.js';
import './components';
import plugins from './plugins';
import Utils from './utils';
import defaults from './config/defaults';
import Eventable from './mixins/eventable';
import ExtendedEvents from './extended-events';
import PlaylistWidget from './components/playlist/playlist-widget';
// #if (!process.env.WEBPACK_BUILD_LIGHT)
import qualitySelector from './components/qualitySelector/qualitySelector.js';
// #endif
import VideoSource from './plugins/cloudinary/models/video-source/video-source';
import { isFunction, isString, isPlainObject } from './utils/type-inference';
import {
  extractOptions,
  getResolveVideoElement,
  overrideDefaultVideojsComponents
} from './video-player.utils';
import { FLOATING_TO, FLUID_CLASS_NAME } from './video-player.const';
// #if (!process.env.WEBPACK_BUILD_LIGHT)
import { interactionAreaService } from './components/interaction-area/interaction-area.service';
// #endif
import { isValidConfig } from './validators/validators-functions';
import { playerValidators, sourceValidators } from './validators/validators';
import { get, pick } from './utils/object';
import { flatten } from './utils/json';
import { PLAYER_EVENT, SOURCE_TYPE } from './utils/consts';
import { extendCloudinaryConfig, normalizeOptions, isRawUrl } from './plugins/cloudinary/common';

const INTERNAL_ANALYTICS_URL = 'https://analytics-api-s.cloudinary.com';

// Register all plugins
Object.keys(plugins).forEach((key) => {
  videojs.registerPlugin(key, plugins[key]);
});

overrideDefaultVideojsComponents();

let _allowUsageReport = true;

class VideoPlayer extends Utils.mixin(Eventable) {

  static all(selector, ...args) {
    const nodeList = document.querySelectorAll(selector);
    return [...nodeList].map((node) => new VideoPlayer(node, ...args));
  }

  static allowUsageReport(bool) {
    if (bool === undefined) {
      return _allowUsageReport;
    }

    _allowUsageReport = !!bool;
    return _allowUsageReport;
  }

  static buildTextTrackObj (type, conf) {
    return {
      kind: type,
      label: conf.label,
      srclang: conf.language,
      default: !!(conf.default),
      src: conf.url
    };
  }

  constructor(elem, initOptions, ready) {
    super();

    this._playlistWidget = null;
    this.nbCalls = 0;

    this.videoElement = getResolveVideoElement(elem);

    this.options = extractOptions(this.videoElement, initOptions);

    this._videojsOptions = this.options.videojsOptions;

    // Make sure to add 'video-js' class before creating videojs instance
    this.videoElement.classList.add('video-js');

    // Handle WebFont loading
    Utils.fontFace(this.videoElement, this.playerOptions);

    // Handle play button options
    Utils.playButton(this.videoElement, this._videojsOptions);

    this.videojs = videojs(this.videoElement, this._videojsOptions);

    // to do, should be change by isValidConfig
    this._isPlayerConfigValid = true;

    isValidConfig(this.options, playerValidators);

    if (!this._isPlayerConfigValid) {
      this.videojs.error('invalid player configuration');
      return;
    }

    if (this._videojsOptions.muted) {
      this.videojs.volume(0.4);
    }

    if (this.playerOptions.fluid) {
      this.fluid(this.playerOptions.fluid);
    }

    // #if (!process.env.WEBPACK_BUILD_LIGHT)
    this.interactionArea = interactionAreaService(this, this.playerOptions, this._videojsOptions);
    // #endif

    this._setCssClasses();
    this._initPlugins();
    this._initPlaylistWidget();
    this._initJumpButtons();
    this._setVideoJsListeners(ready);
    this._sendAnalytics(this.playerOptions);
  }

  _sendAnalytics(options) {
    try {
      const name = 'video_player_init';
      const opts = {
        ...options,
        cloudinary: {
          ...options.cloudinary,
          cloudinaryConfig: {
            ...(options.cloudinaryConfig || {})
          }
        }
      };
      delete opts.cloudinary.chainTarget;
      delete opts.cloudinary.cloudinaryConfig.chainTarget;

      const qs = flatten(opts);
      fetch(`${INTERNAL_ANALYTICS_URL}/${name}?${qs}&vp_version=${VERSION}`);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  _clearTimeOut = () => {
    this.videojs.clearTimeout(this.reTryId);
  };

  _setVideoJsListeners(ready) {

    // Prevent flash of error message while lazy-loading plugins.
    videojs.hook('beforeerror', (player, err) => {
      if (err && err.code === 3 && this.loadingLazyPlugins) {
        err = null;
      }
      return err;
    });


    this.videojs.on(PLAYER_EVENT.ERROR, () => {
      const error = this.videojs.error();
      if (error) {
        const type = this._isPlayerConfigValid && this.videojs.cloudinary.currentSourceType();

        /*
         error codes :
           3 - media playback was aborted due to a corruption problem
           4 - media error, media source not supported
         */
        const isCorrupted = error.code === 3 && videojs.browser.IS_SAFARI;

        if ([isCorrupted, error.code === 4].includes(true) && [SOURCE_TYPE.AUDIO, SOURCE_TYPE.VIDEO].includes(type)) {
          this.videojs.error(null);
          Utils.handleCldError(this, this.playerOptions);
        } else {
          this._clearTimeOut();
        }
      }
    });

    this.videojs.tech_.on(PLAYER_EVENT.RETRY_PLAYLIST, () => {
      const mediaRequestsErrored = get(this.videojs, 'hls.stats.mediaRequestsErrored', 0);
      if (mediaRequestsErrored > 0) {
        this._clearTimeOut();
        Utils.handleCldError(this, this.playerOptions);
      }
    });

    this.videojs.on(PLAYER_EVENT.PLAY, this._clearTimeOut);
    this.videojs.on(PLAYER_EVENT.CAN_PLAY_THROUGH, this._clearTimeOut);

    this.videojs.ready(() => {
      this._onReady();

      if (ready) {
        ready(this);
      }

      // #if (!process.env.WEBPACK_BUILD_LIGHT)
      this.interactionArea.init();
      // #endif
    });

  }

  _initPlugins () {
    // #if (!process.env.WEBPACK_BUILD_LIGHT)
    this._initIma();
    // #endif
    this._initAutoplay();
    this._initContextMenu();
    this._initPerSrcBehaviors();
    this._initCloudinary();
    this._initAnalytics();
    this._initCloudinaryAnalytics();
    this._initFloatingPlayer();
    this._initColors();
    this._initTextTracks();
    this._initHighlightsGraph();
    this._initSeekThumbs();
  }

  async _initLazyPlugins(options) {
    this.loadingLazyPlugins = true;

    await this._initDash(options);

    this.loadingLazyPlugins = false;
  }

  async _initDash(options) {
    const isDashRequired = options.sourceTypes && options.sourceTypes.some(s => s.includes('dash'));
    if (plugins.dashPlugin && isDashRequired) {
      await plugins.dashPlugin();
    }
  }

  _isFullScreen() {
    return this.videojs.player().isFullscreen();
  }

  _initIma () {
    if (this.playerOptions.ads && Object.keys(this.playerOptions.ads).length !== 0) {
      plugins.imaPlugin(this.videojs, this.playerOptions);
    }
  }

  setTextTracks (conf) {
    // remove current text tracks
    const currentTracks = this.videojs.remoteTextTracks();
    if (currentTracks) {
      for (let i = currentTracks.tracks_.length - 1; i >= 0; i--) {
        this.videojs.removeRemoteTextTrack(currentTracks.tracks_[i]);
      }
    }
    if (conf) {
      const tracks = Object.keys(conf);
      const allTracks = [];
      for (const track of tracks) {
        if (Array.isArray(conf[track])) {
          const trks = conf[track];
          for (let i = 0; i < trks.length; i++) {
            allTracks.push(VideoPlayer.buildTextTrackObj(track, trks[i]));
          }
        } else {
          allTracks.push(VideoPlayer.buildTextTrackObj(track, conf[track]));
        }
      }

      Utils.filterAndAddTextTracks(allTracks, this.videojs);
    }
  }

  _initSeekThumbs() {
    if (this.playerOptions.seekThumbnails) {

      this.videojs.on(PLAYER_EVENT.CLD_SOURCE_CHANGED, (e, { source }) => {
        if (
          !source ||
          source.getType() === SOURCE_TYPE.AUDIO || // Is Audio
          isRawUrl(source.publicId()) || // Is a raw url
          (this.videojs.activePlugins_ && this.videojs.activePlugins_.vr) // It's a VR (i.e. 360)
        ) {
          return;
        }

        const publicId = source.publicId();

        const transformation = Utils.assign({}, source.transformation());

        if (transformation && transformation.streaming_profile) {
          delete transformation.streaming_profile;
        }

        transformation.flags = transformation.flags || [];
        transformation.flags.push('sprite');

        const vttSrc = source.config()
          .url(`${publicId}.vtt`, { transformation })
          .replace(/\.json$/, ''); // Handle playlist by tag

        // vttThumbnails must be called differently on init and on source update.
        isFunction(this.videojs.vttThumbnails)
          ? this.videojs.vttThumbnails({ src: vttSrc })
          : this.videojs.vttThumbnails.src(vttSrc);
      });
    }
  }

  _initHighlightsGraph() {
    if (this.playerOptions.aiHighlightsGraph) {
      this.videojs.on(PLAYER_EVENT.CLD_SOURCE_CHANGED, (e, { source }) => {
        if (
          !source ||
          source.getType() === SOURCE_TYPE.AUDIO || // Is Audio
          isRawUrl(source.publicId()) // Is a raw url
        ) {
          return;
        }

        const publicId = source.publicId();

        // Keep video-length related transformations and remove the rest
        const inputTransformations = pick(source.transformation(), ['start_offset', 'end_offset', 'duration']);

        const transformation = Utils.assign({}, inputTransformations);

        transformation.effect = 'preview';
        transformation.flags = transformation.flags || [];
        transformation.flags.push('getinfo');

        const aiHighlightsGraphSrc = source.config()
          .url(`${publicId}`, { transformation })
          .replace(/\.json$/, ''); // Handle playlist by tag

        // Plugin is called differently on init and on source update.
        isFunction(this.videojs.aiHighlightsGraph)
          ? this.videojs.aiHighlightsGraph({ src: aiHighlightsGraphSrc })
          : this.videojs.aiHighlightsGraph.src(aiHighlightsGraphSrc);
      });
    }
  }

  _initColors () {
    this.videojs.colors(this.playerOptions.colors ? { colors: this.playerOptions.colors } : {});
  }

  // #if (!process.env.WEBPACK_BUILD_LIGHT)
  _initQualitySelector() {
    if (this._videojsOptions.controlBar && this.playerOptions.qualitySelector !== false) {
      this.videojs.httpSourceSelector({ default: 'auto' });

      this.videojs.on(PLAYER_EVENT.LOADED_METADATA, () => {
        qualitySelector.init(this.videojs);
      });

      // Show only if more than one option available
      this.videojs.on(PLAYER_EVENT.LOADED_DATA, () => {
        qualitySelector.setVisibility(this.videojs);
      });
    }
  }
  // #endif

  _initTextTracks () {
    this.videojs.on(PLAYER_EVENT.REFRESH_TEXT_TRACKS, (e, tracks) => {
      this.setTextTracks(tracks);
    });
  }

  _initPerSrcBehaviors() {
    if (this.videojs.perSourceBehaviors) {
      this.videojs.perSourceBehaviors();
    }
  }

  _initJumpButtons() {
    if (!this.playerOptions.showJumpControls && this.videojs.controlBar) {
      this.videojs.controlBar.removeChild('JumpForwardButton');
      this.videojs.controlBar.removeChild('JumpBackButton');
    }
  }

  _initCloudinary() {
    const { cloudinaryConfig } = this.playerOptions.cloudinary;
    cloudinaryConfig.chainTarget = this;

    if (cloudinaryConfig.secure !== false) {
      extendCloudinaryConfig(cloudinaryConfig, { secure: true });
    }

    this.videojs.cloudinary(this.playerOptions.cloudinary);
  }

  _initAnalytics() {
    const analyticsOpts = this.playerOptions.analytics;

    if (!window.ga && analyticsOpts) {
      console.error('Google Analytics script is missing');
      return;
    }

    if (analyticsOpts) {
      const opts = typeof analyticsOpts === 'object' ? analyticsOpts : {};
      this.videojs.analytics(opts);
    }
  }

  _initCloudinaryAnalytics() {
    const cloudinaryAnalyticsOptionEnabled = this.playerOptions.cloudinaryAnalytics;

    if (cloudinaryAnalyticsOptionEnabled) {
      this.videojs.videoElement = this.videoElement;
      this.videojs.cloudinaryAnalytics();
    }
  }

  reTryVideo(maxNumberOfCalls, timeout) {
    if (!this.isVideoReady()) {
      if (this.nbCalls < maxNumberOfCalls) {
        this.nbCalls++;
        this.reTryId = this.videojs.setTimeout(() => this.reTryVideo(maxNumberOfCalls, timeout), timeout);
      } else {
        let e = new Error('Video is not ready please try later');
        this.videojs.trigger('error', e);
      }
    }
  }

  isVideoReady() {
    const s = this.videojs.readyState();
    if (s >= (/iPad|iPhone|iPod/.test(navigator.userAgent) ? 1 : 4)) {
      this.nbCalls = 0;
      return true;
    }

    return false;
  }

  _initPlaylistWidget () {
    this.videojs.on(PLAYER_EVENT.PLAYLIST_CREATED, () => {

      if (this._playlistWidget) {
        this._playlistWidget.dispose();
      }
      const plwOptions = this.playerOptions.playlistWidget;

      if (isPlainObject(plwOptions)) {
        if (this.playerOptions.fluid) {
          plwOptions.fluid = true;
        }

        if (this.playerOptions.cloudinary.fontFace) {
          plwOptions.fontFace = this.playerOptions.cloudinary.fontFace;
        }

        this._playlistWidget = new PlaylistWidget(this.videojs, plwOptions);
      }
    });
  }

  playlistWidget(options) {
    if (!options && !this._playlistWidget) {
      return false;
    }

    if (!options && this._playlistWidget) {
      return this._playlistWidget;
    }

    if (isPlainObject(options)) {
      this._playlistWidget.options(options);
    }

    return this._playlistWidget;
  }

  _initAutoplay() {
    const autoplayMode = this.playerOptions.autoplayMode;

    if (autoplayMode === 'on-scroll') {
      this.videojs.autoplayOnScroll();
    }
  }

  _initContextMenu() {
    if (!this.playerOptions.hideContextMenu) {
      this.videojs.contextMenu(defaults.contextMenu);
    }
  }

  _initFloatingPlayer() {
    if (this.playerOptions.floatingWhenNotVisible !== FLOATING_TO.NONE) {
      this.videojs.floatingPlayer({ floatTo: this.playerOptions.floatingWhenNotVisible });
    }
  }

  _setCssClasses() {
    this.videojs.addClass(Utils.CLASS_PREFIX);
    this.videojs.addClass(Utils.playerClassPrefix(this.videojs));

    Utils.setSkinClassPrefix(this.videojs, Utils.skinClassPrefix(this.videojs));
  }

  _onReady() {
    this._setExtendedEvents();

    // Load first video (mainly to support video tag 'source' and 'public-id' attributes)
    const source = this.playerOptions.source || this.playerOptions.publicId;

    if (source) {
      this.source(source, this.playerOptions);
    }
  }

  _setExtendedEvents() {
    const events = [];
    if (this.playerOptions.playedEventPercents) {
      events.push({
        type: PLAYER_EVENT.PERCENTS_PLAYED,
        percents: this.playerOptions.playedEventPercents
      });
    }

    if (this.playerOptions.playedEventTimes) {
      events.push({
        type: PLAYER_EVENT.TIME_PLAYED,
        times: this.playerOptions.playedEventTimes
      });
    }

    events.push(...[PLAYER_EVENT.SEEK, PLAYER_EVENT.MUTE, PLAYER_EVENT.UNMUTE, PLAYER_EVENT.QUALITY_CHANGED]);

    const extendedEvents = new ExtendedEvents(this.videojs, { events });

    Object.keys(extendedEvents.events).forEach((_event) => {
      const handler = (event, data) => {
        this.videojs.trigger({ type: _event, eventData: data });
      };
      extendedEvents.on(_event, handler);
    });
  }

  cloudinaryConfig(config) {
    return this.videojs.cloudinary.cloudinaryConfig(config);
  }

  get playerOptions() {
    return this.options.playerOptions;
  }

  currentPublicId() {
    return this.videojs.cloudinary.currentPublicId();
  }

  currentSourceUrl() {
    return this.videojs.currentSource().src;
  }

  currentPoster() {
    return this.videojs.cloudinary.currentPoster();
  }

  source(publicId, options = {}) {
    ({ publicId, options } = normalizeOptions(publicId, options));

    if (!this._isPlayerConfigValid) {
      return;
    }

    const isSourceConfigValid = isValidConfig(options, sourceValidators);

    if (!isSourceConfigValid) {
      this.videojs.error('invalid source configuration');
      return;
    }

    if (publicId instanceof VideoSource) {
      return this.videojs.cloudinary.source(publicId, options);
    }

    // Interactive plugin - available in full (not light) build only
    if (this.videojs.interactive) {
      this.videojs.interactive(this.videojs, options);
    }

    if (VideoPlayer.allowUsageReport()) {
      options.usageReport = true;
    }

    this.setTextTracks(options.textTracks);

    // #if (!process.env.WEBPACK_BUILD_LIGHT)
    this._initQualitySelector();
    // #endif

    clearTimeout(this.reTryId);
    this.nbCalls = 0;
    const maxTries = this.videojs.options_.maxTries || 3;
    const videoReadyTimeout = this.videojs.options_.videoTimeout || 55000;
    this.reTryVideo(maxTries, videoReadyTimeout);

    // Lazy loaded plugins
    this._initLazyPlugins(options).then(() => {
      return this.videojs.cloudinary.source(publicId, options);
    });

    return this.videojs.cloudinary.source(publicId, options);
  }

  posterOptions(options) {
    return this.videojs.cloudinary.posterOptions(options);
  }

  skin(name) {
    if (name !== undefined && isString(name)) {
      Utils.setSkinClassPrefix(this.videojs, name);

      const playlistWidget = this.playlistWidget();

      if (playlistWidget) {
        playlistWidget.setSkin();
      }
    }

    return Utils.skinClassPrefix(this.videojs);
  }

  playlist(sources, options = {}) {
    this._initQualitySelector();
    return this.videojs.cloudinary.playlist(sources, options);
  }

  playlistByTag(tag, options = {}) {
    return this.videojs.cloudinary.playlistByTag(tag, options);
  }

  sourcesByTag(tag, options = {}) {
    return this.videojs.cloudinary.sourcesByTag(tag, options);
  }

  fluid(bool) {
    if (bool === undefined) {
      return this.videojs.fluid();
    }

    if (bool) {
      this.videojs.addClass(FLUID_CLASS_NAME);
    } else {
      this.videojs.removeClass(FLUID_CLASS_NAME);
    }

    this.videojs.fluid(bool);
    this.videojs.trigger(PLAYER_EVENT.FLUID, bool);
    return this;
  }

  play() {
    this.playWasCalled = true;
    this.videojs.play();
    return this;
  }

  stop() {
    this.pause();
    this.currentTime(0);
    return this;
  }

  playPrevious() {
    this.playlist().playPrevious();
    return this;
  }

  playNext() {
    this.playlist().playNext();
    return this;
  }

  transformation(trans) {
    return this.videojs.cloudinary.transformation(trans);
  }

  sourceTypes(types) {
    return this.videojs.cloudinary.sourceTypes(types);
  }

  sourceTransformation(trans) {
    return this.videojs.cloudinary.sourceTransformation(trans);
  }

  autoShowRecommendations(autoShow) {
    return this.videojs.cloudinary.autoShowRecommendations(autoShow);
  }

  duration() {
    return this.videojs.duration();
  }

  height(dimension) {
    if (!dimension) {
      return this.videojs.height();
    }

    this.videojs.height(dimension);

    return this;
  }

  width(dimension) {
    if (!dimension) {
      return this.videojs.width();
    }

    this.videojs.width(dimension);

    return this;
  }

  volume(volume) {
    if (!volume) {
      return this.videojs.volume();
    }

    this.videojs.volume(volume);

    return this;
  }

  mute() {
    if (!this.isMuted()) {
      this.videojs.muted(true);
    }

    return this;
  }

  unmute() {
    if (this.isMuted()) {
      this.videojs.muted(false);
    }

    return this;
  }

  isMuted() {
    return this.videojs.muted();
  }

  pause() {
    this.videojs.pause();

    return this;
  }

  currentTime(offsetSeconds) {
    if (!offsetSeconds && offsetSeconds !== 0) {
      return this.videojs.currentTime();
    }

    this.videojs.currentTime(offsetSeconds);

    return this;
  }

  maximize() {
    if (!this.isMaximized()) {
      this.videojs.requestFullscreen();
    }

    return this;
  }

  exitMaximize() {
    if (this.isMaximized()) {
      this.videojs.exitFullscreen();
    }

    return this;
  }

  isMaximized() {
    return this.videojs.isFullscreen();
  }

  dispose() {
    this.videojs.dispose();
  }

  controls(bool) {
    if (bool === undefined) {
      return this.videojs.controls();
    }

    this.videojs.controls(bool);

    return this;
  }

  ima() {
    return {
      playAd: this.videojs.ima.playAd
    };
  }

  loop(bool) {
    if (bool === undefined) {
      return this.videojs.loop();
    }

    this.videojs.loop(bool);

    return this;
  }

  el() {
    return this.videojs.el();
  }
}

export default VideoPlayer;
