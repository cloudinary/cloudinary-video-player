import videojs from 'video.js';
import { v4 as uuidv4 } from 'uuid';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import pick from 'lodash/pick';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import './components';
import plugins from './plugins';
import Utils from './utils';
import defaults from './config/defaults';
import Eventable from './mixins/eventable';
import ExtendedEvents from './extended-events';
import VideoSource from './plugins/cloudinary/models/video-source/video-source';
import {
  extractOptions,
  getResolveVideoElement,
  overrideDefaultVideojsComponents
} from './video-player.utils';
import { FLOATING_TO, FLUID_CLASS_NAME } from './video-player.const';
import { isValidPlayerConfig, isValidSourceConfig } from './validators/validators-functions';
import { PLAYER_EVENT, SOURCE_TYPE } from './utils/consts';
import { getAnalyticsFromPlayerOptions } from './utils/get-analytics-player-options';
import { extendCloudinaryConfig, normalizeOptions, isRawUrl, ERROR_CODE } from './plugins/cloudinary/common';
import { isVideoInReadyState, checkIfVideoIsAvailable } from './utils/video-retry';
import { SOURCE_PARAMS } from './video-player.const';

const INTERNAL_ANALYTICS_URL = 'https://analytics-api-s.cloudinary.com';

const RETRY_DEFAULT_TIMEOUT = 5 * 1000;

// Register all plugins
Object.keys(plugins).forEach((key) => {
  videojs.registerPlugin(key, plugins[key]);
});

overrideDefaultVideojsComponents();

class VideoPlayer extends Utils.mixin(Eventable) {

  static all(selector, ...args) {
    const nodeList = document.querySelectorAll(selector);
    return [...nodeList].map((node) => new VideoPlayer(node, ...args));
  }

  get playerOptions() {
    return this.options.playerOptions;
  }

  constructor(elem, initOptions, ready) {
    super();

    this.videoElement = getResolveVideoElement(elem);

    this.options = extractOptions(this.videoElement, initOptions);

    this._videojsOptions = this.options.videojsOptions;

    // Make sure to add 'video-js' class before creating videojs instance
    this.videoElement.classList.add('video-js');

    // Handle WebFont loading
    Utils.fontFace(this.videoElement, this.playerOptions.cloudinary.fontFace);

    // Handle play button options
    if (this._videojsOptions.bigPlayButton === 'init') {
      this.videoElement.classList.add('vjs-big-play-button-init-only');
      this._videojsOptions.bigPlayButton = true;
    }

    this.videojs = videojs(this.videoElement, this._videojsOptions);

    this._isPlayerConfigValid = true;
    if (this.playerOptions.debug) {
      isValidPlayerConfig(this.options).then((valid) => {
        if (!valid) {
          this._isPlayerConfigValid = false;
          this.videojs.error('invalid player configuration');
          return;
        }
      });
    }

    if (this._videojsOptions.muted) {
      this.videojs.volume(0.4);
    }

    if (this.playerOptions.fluid) {
      this.fluid(this.playerOptions.fluid);
    }

    this._setCssClasses();
    this._initPlugins();
    this._initJumpButtons();
    this._initPictureInPicture();
    this._setVideoJsListeners(ready);
  }

  getVPInstanceId() {
    if (!this.vpInstanceId) {
      this.vpInstanceId = uuidv4();
    }

    return this.vpInstanceId;
  }

  _sendInternalAnalytics(additionalOptions = {}) {
    const options = Object.assign({}, this.playerOptions, this.options.videojsOptions, additionalOptions);
    if (!options.allowUsageReport) {
      return;
    }
    try {
      const internalAnalyticsMetadata = options._internalAnalyticsMetadata ?? {};
      const analyticsData = getAnalyticsFromPlayerOptions(options);
      const analyticsParams = new URLSearchParams(analyticsData).toString();
      const baseParams = new URLSearchParams({
        vpVersion: VERSION,
        vpInstanceId: this.getVPInstanceId(),
        cloudName: options.cloudinary.cloudinaryConfig.cloud_name,
        ...internalAnalyticsMetadata,
      }).toString();
      fetch(`${INTERNAL_ANALYTICS_URL}/video_player_source?${analyticsParams}&${baseParams}`);
    } catch (err) {
      console.warn(err);
    }
  }

  _resetReTryVideoState = () => {
    this.reTryVideoStateRetriesCount = 0;
    this.videojs.clearTimeout(this.reTryVideoStateTimeoutId);
  };

  _setVideoJsListeners(ready) {
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
          if (this.isLiveStream) {
            this.videojs.error({
              code: ERROR_CODE.CUSTOM,
              message: 'Live Stream not started',
            });
            this.reloadVideoUntilAvailable();
          } else {
            this.videojs.error(null);
            Utils.handleCldError(this, this.playerOptions);
          }
        } else {
          this._resetReTryVideoState();
        }
      }
    });

    this.videojs.tech_.on(PLAYER_EVENT.RETRY_PLAYLIST, () => {
      const mediaRequestsErrored = get(this.videojs, 'hls.stats.mediaRequestsErrored', 0);
      if (mediaRequestsErrored > 0) {
        this._resetReTryVideoState();
        Utils.handleCldError(this, this.playerOptions);
      }
    });

    this.videojs.on(PLAYER_EVENT.PLAY, this._resetReTryVideoState);
    this.videojs.on(PLAYER_EVENT.CAN_PLAY_THROUGH, this._resetReTryVideoState);
    this.videojs.on(PLAYER_EVENT.CLD_SOURCE_CHANGED, this._onSourceChange.bind(this));

    this.videojs.ready(() => {
      this._onReady();

      if (ready) {
        ready(this);
      }
    });
  }

  _initPlugins () {
    this._initIma();
    this._initAutoplay();
    this._initContextMenu();
    this._initPerSrcBehaviors();
    this._initCloudinary();
    this._initAnalytics();
    this._initCloudinaryAnalytics();
    this._initFloatingPlayer();
    this._initVisualSearch();
    this._initColors();
    this._initTextTracks();
    this._initHighlightsGraph();
    this._initSeekThumbs();
    this._initChapters();
    this._initInteractionAreas();
  }

  _isFullScreen() {
    return this.videojs.player().isFullscreen();
  }

  _initIma() {
    if (this.playerOptions.ads && Object.keys(this.playerOptions.ads).length !== 0) {
      plugins.imaPlugin(this.videojs, this.playerOptions);
    }
  }

  setTextTracks(conf) {
    // remove current text tracks
    const currentTracks = this.videojs.remoteTextTracks();
    if (currentTracks) {
      for (let i = currentTracks.tracks_.length - 1; i >= 0; i--) {
        this.videojs.removeRemoteTextTrack(currentTracks.tracks_[i]);
      }
    }
    if (conf) {
      const kinds = Object.keys(conf);
      const allTracks = [];
      for (const kind of kinds) {
        if (kind !== 'options') {
          const tracks = Array.isArray(conf[kind]) ? conf[kind] : [conf[kind]];
          for (const track of tracks) {
            allTracks.push({
              ...track,
              kind: kind,
              label: track.label,
              srclang: track.language,
              default: !!(track.default),
              src: track.url
            });
          }
        }
      }
      Utils.addTextTracks(allTracks, this.videojs);

      if (conf.options && this.videojs.styledTextTracks) {
        this.videojs.styledTextTracks(conf.options);
      }
    }
  }

  _initSeekThumbs() {
    if (this.playerOptions.seekThumbnails) {

      this.videojs.on(PLAYER_EVENT.CLD_SOURCE_CHANGED, (e, { source }) => {
        if (
          !source ||
          source.getType() === SOURCE_TYPE.AUDIO || // Is Audio
          source.resourceConfig().type === 'live' || // Is live stream
          isRawUrl(source.publicId()) || // Is a raw url
          (this.videojs.activePlugins_ && this.videojs.activePlugins_.vr) // It's a VR (i.e. 360)
        ) {
          return;
        }

        const publicId = source.publicId();

        const transformation = Object.assign({}, source.transformation());

        if (transformation) {
          delete transformation.streaming_profile;
          delete transformation.video_codec;
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

        const transformation = Object.assign({}, inputTransformations);

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

  _initChapters() {
    if (!this.playerOptions.chaptersButton && this.videojs.controlBar) {
      this.videojs.controlBar.removeChild('chaptersButton');
    }
    this.videojs.on(PLAYER_EVENT.CLD_SOURCE_CHANGED, (e, { source }) => {
      if ((!isEmpty(source._chapters) || source._chapters === true) && this.videojs.chapters) {
        isFunction(this.videojs.chapters)
          ? this.videojs.chapters(source._chapters)
          : this.videojs.chapters.src(source._chapters);
      } else if (this.videojs.chapters?.resetPlugin) {
        this.videojs.chapters.resetPlugin();
      }
    });
  }

  _initInteractionAreas() {
    this.videojs.on(PLAYER_EVENT.READY, async () => {
      if (this.options.videojsOptions.interactionDisplay && this.videojs.interactionAreas) {
        this.videojs.interactionAreas(this, this.playerOptions, this._videojsOptions);
      }
    });
  }

  _initVisualSearch() {
    // Listen for source changes to apply visual search based on source config
    this.videojs.on(PLAYER_EVENT.CLD_SOURCE_CHANGED, (e, { source }) => {
      if (source._visualSearch && this.videojs.visualSearch) {
        isFunction(this.videojs.visualSearch)
          ? this.videojs.visualSearch(source._visualSearch)
          : this.videojs.visualSearch.createSearchUI(source._visualSearch);
      } else if (!source._visualSearch && this.videojs.visualSearch?.clearUI) {
        this.videojs.visualSearch.clearUI();
      }
    });
  }

  _initColors () {
    this.videojs.colors(this.playerOptions.colors ? { colors: this.playerOptions.colors } : {});
  }

  _initTextTracks () {
    this.videojs.on(PLAYER_EVENT.CLD_SOURCE_CHANGED, (e, { source }) => {
      this.setTextTracks(source._textTracks);
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

  _initPictureInPicture() {
    if (!this.playerOptions.pictureInPictureToggle && this.videojs.controlBar) {
      this.videojs.controlBar.removeChild('pictureInPictureToggle');
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

    if (!window.gtag && analyticsOpts) {
      console.error('Google Analytics script (gtag) is missing.');
      return;
    }

    if (analyticsOpts) {
      const opts = typeof analyticsOpts === 'object' ? analyticsOpts : {};
      this.videojs.analytics(opts);
    }
  }

  _initCloudinaryAnalytics() {
    const cloudinaryAnalyticsOptionEnabled = !!this.playerOptions.cloudinaryAnalytics;

    if (cloudinaryAnalyticsOptionEnabled) {
      this.videojs.videoElement = this.videoElement;
      const options = isObject(this.playerOptions.cloudinaryAnalytics) ? this.playerOptions.cloudinaryAnalytics : {};
      this.videojs.cloudinaryAnalytics(options);
    }
  }

  reTryVideoStateUntilAvailable(maxNumberOfCalls = Number.POSITIVE_INFINITY, timeout = RETRY_DEFAULT_TIMEOUT) {
    if (typeof this.reTryVideoStateRetriesCount !== 'number') {
      this.reTryVideoStateRetriesCount = 0;
    }

    if (!isVideoInReadyState(this.videojs.readyState())) {
      if (this.reTryVideoStateRetriesCount < maxNumberOfCalls) {
        this.reTryVideoStateRetriesCount++;
        this.reTryVideoStateTimeoutId = this.videojs.setTimeout(() => this.reTryVideoStateUntilAvailable(maxNumberOfCalls, timeout), timeout);
      } else {
        let e = new Error('Video is not ready please try later');
        this.videojs.trigger('error', e);
      }
    } else {
      this.reTryVideoStateRetriesCount = 0;
    }
  }

  _resetReloadVideo = () => {
    this.reloadVideoRetriesCount = 0;
    this.videojs.clearTimeout(this.reloadVideoTimeoutId);
  };

  reloadVideoUntilAvailable(maxNumberOfCalls = Number.POSITIVE_INFINITY, timeout = RETRY_DEFAULT_TIMEOUT) {
    if (typeof this.reloadVideoRetriesCount !== 'number') {
      this.reloadVideoRetriesCount = 0;
    }

    if (this.reloadVideoRetriesCount < maxNumberOfCalls) {
      this.reloadVideoRetriesCount++;
      this.reloadVideoTimeoutId = this.videojs.setTimeout(() => {
        const videoUrl = this.currentSourceUrl();
        checkIfVideoIsAvailable(videoUrl, this.isLiveStream ? 'live' : 'default')
          .then(() => this.source(videoUrl))
          .catch(() => this.reloadVideoUntilAvailable(maxNumberOfCalls, timeout));
      }, timeout);
    } else {
      this.videojs.trigger('error', new Error('Sorry, we could not load your video'));
    }
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
    // Source parameters are set to playerOptions.cloudinary
    const source = this.playerOptions.cloudinary.source || this.playerOptions.cloudinary.publicId;

    if (source) {
      const sourceOptions = Object.assign({}, this.playerOptions.cloudinary);
      
      this.source(source, sourceOptions);
    }
  }

  _onSourceChange(e, { source, sourceOptions }) {
    this._sendInternalAnalytics({ ...(sourceOptions && { sourceOptions }) });
    this.isLiveStream = source.resourceConfig().type === 'live';
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

    if (this.playerOptions.debug) {
      options.debug = true;

      isValidSourceConfig(options).then((valid) => {
        if (!valid) {
          this.videojs.error('invalid source configuration');
        }
      });
    }
    
    if (publicId instanceof VideoSource) {
      return this.videojs.cloudinary.source(publicId, options);
    }

    // Inherit source parameters from player options (source options take precedence)
    const inherited = pick(this.playerOptions, SOURCE_PARAMS);
    options = { ...inherited, ...options };

    if (options.shoppable && this.videojs.shoppable) {
      this.videojs.shoppable(this.videojs, options);
    }

    this._resetReloadVideo();
    this._resetReTryVideoState();

    const maxTries = this.videojs.options_.maxTries || 3;
    const videoReadyTimeout = this.videojs.options_.videoTimeout || 55000;
    this.reTryVideoStateUntilAvailable(maxTries, videoReadyTimeout);

    return this.videojs.cloudinary.source(publicId, options);
  }

  posterOptions(options) {
    return this.videojs.cloudinary.posterOptions(options);
  }

  skin(name) {
    if (name !== undefined && isString(name)) {
      Utils.setSkinClassPrefix(this.videojs, name);
    }

    return Utils.skinClassPrefix(this.videojs);
  }

  playlist(sources, options = {}) {
    options = Object.assign({}, options, { playlistWidget: this.playerOptions.playlistWidget });

    this.videojs.one(PLAYER_EVENT.READY, async () => {
      const playlistPlugin = await this.videojs.playlist(options);
      playlistPlugin(sources, options);
    });

    return this.videojs.cloudinary.playlist ? this.videojs.cloudinary.playlist(sources, options) : this;
  }

  playlistByTag(tag, options = {}) {
    options = Object.assign({}, options, { playlistWidget: this.playerOptions.playlistWidget });

    return new Promise((resolve) => {
      this.videojs.one(PLAYER_EVENT.READY, async () => {
        const playlistPlugin = await this.videojs.playlist(options);
        playlistPlugin(await this.sourcesByTag(tag, options), options);
        resolve(this);
      });
    });
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
