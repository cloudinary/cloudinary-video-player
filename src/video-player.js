import videojs from 'video.js';
import isObj from 'is-obj';
import './components';
import * as plugins from 'plugins';
import * as Utils from 'utils';
import assign from 'utils/assign';
import defaults from 'config/defaults';
import Eventable from 'mixins/eventable';
import ExtendedEvents from 'extended-events';
import normalizeAttributes from './attributes-normalizer';
import PlaylistWidget from './components/playlist/playlist-widget';

import {
  CLASS_PREFIX,
  skinClassPrefix,
  setSkinClassPrefix,
  playerClassPrefix
} from './utils/css-prefix';
import VideoSource from './plugins/cloudinary/models/video-source';


const CLOUDINARY_PARAMS = [
  'cloudinaryConfig',
  'transformation',
  'sourceTypes',
  'sourceTransformation',
  'posterOptions',
  'autoShowRecommendations',
  'fontFace'];

const PLAYER_PARAMS = CLOUDINARY_PARAMS.concat([
  'publicId',
  'source',
  'autoplayMode',
  'playedEventPercents',
  'playedEventTimes',
  'analytics',
  'fluid',
  'ima',
  'playlistWidget',
  'hideContextMenu',
  'colors',
  'floatingWhenNotVisible',
  'ads',
  'showJumpControls',
  'textTracks',
  'fetchErrorUsingGet'
]);

const DEFAULT_HLS_OPTIONS = {
  html5: {
    nativeTextTracks: false,
    hls: {
      overrideNative: videojs && videojs.browser ? !videojs.browser.IS_IOS && !videojs.browser.IS_SAFARI : true
    }
  }
};

// Register all plugins
Object.keys(plugins).forEach((key) => {
  videojs.registerPlugin(key, plugins[key]);
});

const normalizeAutoplay = (options) => {
  const autoplayMode = options.autoplayMode;
  if (autoplayMode) {
    switch (autoplayMode) {
      case 'always':
        options.autoplay = true;
        break;
      case 'on-scroll':
      case 'never':
      default:
        options.autoplay = false;
    }
  }
};

const resolveVideoElement = (elem) => {
  if (typeof elem === 'string') {
    let id = elem;

    // Adjust for jQuery ID syntax
    if (id.indexOf('#') === 0) {
      id = id.slice(1);
    }

    elem = document.querySelector(`#${id}`);

    if (!elem) {
      throw new Error(`Could not find element with id ${id}`);
    }
  }

  if (!elem.tagName) {
    throw new Error('Must specify either an element or an element id.');
  } else if (elem.tagName !== 'VIDEO') {
    throw new Error('Element is not a video tag.');
  }

  return elem;
};

const extractOptions = (elem, options) => {
  const elemOptions = normalizeAttributes(elem);

  if (videojs.dom.hasClass(elem, 'cld-fluid') || videojs.dom.hasClass(elem, 'vjs-fluid')) {
    options.fluid = true;
  }

  // Default HLS options < Default options < Markup options < Player options
  options = assign({}, DEFAULT_HLS_OPTIONS, defaults, elemOptions, options);

  // In case of 'autoplay on scroll', we need to make sure normal HTML5 autoplay is off
  normalizeAutoplay(options);

  // VideoPlayer specific options
  const playerOptions = Utils.sliceAndUnsetProperties(
    options,
    ...PLAYER_PARAMS);

  // Cloudinary plugin specific options
  playerOptions.cloudinary = Utils.sliceAndUnsetProperties(
    playerOptions,
    ...CLOUDINARY_PARAMS);

  // Allow explicitly passing options to videojs using the `videojs` namespace, in order
  // to avoid param name conflicts:
  // VideoPlayer.new({ controls: true, videojs: { controls: false })
  if (options.videojs) {
    assign(options, options.videojs);
    delete options.videojs;
  }

  return { playerOptions, videojsOptions: options };
};

const overrideDefaultVideojsComponents = () => {
  const Player = videojs.getComponent('Player');
  let children = Player.prototype.options_.children;

  // Add TitleBar as default
  children.push('titleBar');
  children.push('upcomingVideoOverlay');
  children.push('recommendationsOverlay');

  const ControlBar = videojs.getComponent('ControlBar');
  if (ControlBar) {
    children = ControlBar.prototype.options_.children;
    // Add space instead of the progress control (which we deattached from the controlBar, and absolutely positioned it above it)
    // Also add a blank div underneath the progress control to stop bubbling up pointer events.
    children.splice(children.indexOf('progressControl'), 0, 'spacer',
      'progressControlEventsBlocker');

    // Add 'play-previous' and 'play-next' buttons around the 'play-toggle'
    children.splice(children.indexOf('playToggle'), 1, 'playlistPreviousButton', 'JumpBackButton', 'playToggle', 'JumpForwardButton', 'playlistNextButton');

    // Position the 'cloudinary-button' button right next to 'fullscreenToggle'
    children.splice(children.indexOf('fullscreenToggle'), 1, 'cloudinaryButton',
      'fullscreenToggle');
  }
};

overrideDefaultVideojsComponents();

let _allowUsageReport = true;

class VideoPlayer extends Utils.mixin(Eventable) {
  constructor(elem, options, ready) {
    super();

    elem = resolveVideoElement(elem);
    options = extractOptions(elem, options);

    const onReady = () => {
      setExtendedEvents();
      this.fluid(_options.fluid);

      // Load first video (mainly to support video tag 'source' and 'public-id' attributes)
      const source = _options.source || _options.publicId;
      if (source) {
        this.source(source, _options);
      }
    };

    const setExtendedEvents = () => {
      const events = [];
      if (_options.playedEventPercents) {
        const percentsplayed = {
          type: 'percentsplayed',
          percents: _options.playedEventPercents
        };
        events.push(percentsplayed);
      }

      if (_options.playedEventTimes) {
        const timeplayed = {
          type: 'timeplayed',
          times: _options.playedEventTimes
        };
        events.push(timeplayed);
      }

      events.push(...['seek', 'mute', 'unmute', 'qualitychanged']);

      const extendedEvents = new ExtendedEvents(this.videojs, { events });

      const normalizedEvents = extendedEvents.events;

      Object.keys(normalizedEvents).forEach((_event) => {
        const handler = (event, data) => {
          this.videojs.trigger({ type: _event, eventData: data });
        };
        extendedEvents.on(_event, handler);
      });
    };

    const setCssClasses = () => {
      this.videojs.addClass(CLASS_PREFIX);
      this.videojs.addClass(playerClassPrefix(this.videojs));

      setSkinClassPrefix(this.videojs, skinClassPrefix(this.videojs));

      if (videojs.browser.IE_VERSION === 11) {
        this.videojs.addClass('cld-ie11');
      }
    };

    const initPlugins = (loaded) => {
      this.adsEnabled = initIma(loaded);
      initAutoplay();
      initContextMenu();
      initPerSrcBehaviors();
      initCloudinary();
      initAnalytics();
      initFloatingPlayer();
      initColors();
      this.initTextTracks(options.videojsOptions.textTracks);
    };

    const initIma = (loaded) => {
      if (!loaded.contribAdsLoaded || !loaded.imaAdsLoaded) {
        if (_options.ads) {
          if (!loaded.contribAdsLoaded) {
            console.log('contribAds is not loaded');
          }
          if (!loaded.imaAdsLoaded) {
            console.log('imaSdk is not loaded');
          }
        }
        return false;
      }
      if (!_options.ads) {
        _options.ads = {};
      }
      const opts = _options.ads;

      if (Object.keys(opts).length === 0) {
        return false;
      }

      const {
        adTagUrl, prerollTimeout, postrollTimeout, showCountdown, adLabel,
        autoPlayAdBreaks, locale
      } = opts;

      this.videojs.ima({
        id: this.el().id,
        adTagUrl,
        disableFlashAds: true,
        prerollTimeout: prerollTimeout || 5000,
        postrollTimeout: postrollTimeout || 5000,
        showCountdown: (showCountdown !== false),
        adLabel: adLabel || 'Advertisement',
        locale: locale || 'en',
        autoPlayAdBreaks: (autoPlayAdBreaks !== false),
        debug: true
      });
      return true;
    };

    const initAutoplay = () => {
      const autoplayMode = _options.autoplayMode;

      if (autoplayMode === 'on-scroll') {
        this.videojs.autoplayOnScroll();
      }
    };

    const initContextMenu = () => {
      if (!options.playerOptions.hideContextMenu) {
        this.videojs.contextMenu(defaults.contextMenu);
      }
    };

    const initFloatingPlayer = () => {
      if (options.playerOptions.floatingWhenNotVisible) {
        this.videojs.floatingPlayer({ 'floatTo': options.playerOptions.floatingWhenNotVisible });
      }
    };

    const initColors = () => {
      this.videojs.colors(options.playerOptions.colors ? { 'colors': options.playerOptions.colors } : {});
    };

    const initPerSrcBehaviors = () => {
      this.videojs.perSourceBehaviors();
    };

    const initCloudinary = () => {
      const opts = _options.cloudinary;
      opts.chainTarget = this;

      this.videojs.cloudinary(_options.cloudinary);
    };

    const initAnalytics = () => {
      const analyticsOpts = _options.analytics;

      if (analyticsOpts) {
        const opts = typeof analyticsOpts === 'object' ? analyticsOpts : {};
        this.videojs.analytics(opts);
      }
    };

    let _playlistWidget = null;

    const initPlaylistWidget = () => {
      this.videojs.on('playlistcreated', () => {
        if (_playlistWidget) {
          _playlistWidget.dispose();
        }
        const plwOptions = _options.playlistWidget;

        if (isObj(plwOptions)) {
          if (_options.fluid) {
            plwOptions.fluid = true;
          }
          if (_options.cloudinary.fontFace) {
            plwOptions.fontFace = _options.cloudinary.fontFace;
          }
          _playlistWidget = new PlaylistWidget(this.videojs, plwOptions);
        }
      });
    };


    const initJumpButtons = () => {
      if (!_options.showJumpControls && this.videojs.controlBar) {
        this.videojs.controlBar.removeChild('JumpForwardButton');
        this.videojs.controlBar.removeChild('JumpBackButton');
      }
    };

    this.initTextTracks = (conf) => {
      if (conf) {
        const tracks = Object.keys(conf);
        for (const track of tracks) {
          if (Array.isArray(conf[track])) {
            const trks = conf[track];
            for (let i = 0; i < trks.length; i++) {
              let cnf = trks[i];
              this.videojs.addRemoteTextTrack(buildTextTrackObj(track, cnf), true);
            }
          } else {
            this.videojs.addRemoteTextTrack(buildTextTrackObj(track, conf[track]), true);
          }
        }
      }
    };


    const buildTextTrackObj = (type, conf) => ({
      kind: type,
      label: conf.label,
      srclang: conf.language,
      default: !!(conf.default),
      src: conf.url
    });

    const _options = options.playerOptions;
    const _vjs_options = options.videojsOptions;

    // Make sure to add 'video-js' class before creating videojs instance
    Utils.addClass(elem, 'video-js');

    // Handle WebFont loading
    Utils.fontFace(elem, _options);

    // Handle play button options
    Utils.playButton(elem, _vjs_options);

    this.videojs = videojs(elem, _vjs_options);

    if (_vjs_options.muted) {
      this.videojs.volume(0.4);
    }

    /* global google */
    let loaded = {
      contribAdsLoaded: typeof this.videojs.ads === 'function',
      imaAdsLoaded: (typeof google === 'object' && typeof google.ima === 'object')
    };
    setCssClasses();
    initPlugins(loaded);
    initPlaylistWidget();
    initJumpButtons();
    this.videojs.on('error', () => {
      const error = this.videojs.error();
      if (error) {
        let type = this.videojs.cloudinary.currentSourceType();
        if (error.code === 4 && (type === 'VideoSource' || type === 'AudioSource')) {
          this.videojs.error(null);
          Utils.handleCldError(this, _options);
        } else {
          this.videojs.clearTimeout(this.reTryId);
        }
      }
    });

    this.videojs.ready(() => {
      onReady();

      if (ready) {
        ready(this);
      }
    });

    if (this.adsEnabled) {
      if (Object.keys(options.playerOptions.ads).length > 0 &&
        typeof this.videojs.ima === 'object') {
        if (options.playerOptions.ads.adsInPlaylist === 'first-video') {
          this.videojs.one('sourcechanged', () => {
            this.videojs.ima.playAd();
          });

        } else {
          this.videojs.on('sourcechanged', () => {
            this.videojs.ima.playAd();
          });
        }
      }
    }

    this.nbCalls = 0;
    this.reTryVideo = (maxNumberOfCalls, timeout) => {
      if (!this.isVideoReady()) {
        if (this.nbCalls < maxNumberOfCalls) {
          this.nbCalls++;
          this.reTryId = this.videojs.setTimeout(this.reTryVideo, timeout);
        } else {
          let e = new Error('Video is not ready please try later');
          this.videojs.trigger('error', e);
        }
      }

    };

    this.isVideoReady = () => {
      let s = this.videojs.readyState();
      if (s >= (/iPad|iPhone|iPod/.test(navigator.userAgent) ? 1 : 4)) {
        this.nbCalls = 0;
        return true;
      }
      return false;
    };

    this.playlistWidget = (options) => {
      if (!options && !_playlistWidget) {
        return false;
      }

      if (!options && _playlistWidget) {
        return _playlistWidget;
      }

      if (isObj(options)) {
        _playlistWidget.options(options);
      }

      return _playlistWidget;
    };
  }

  static all(selector, ...args) {
    const nodeList = document.querySelectorAll(selector);
    const players = [];

    for (let i = 0; i < nodeList.length; i++) {
      players.push(new VideoPlayer(nodeList[i], ...args));
    }

    return players;
  }

  static allowUsageReport(bool) {
    if (bool === undefined) {
      return _allowUsageReport;
    }

    _allowUsageReport = !!bool;
    return _allowUsageReport;
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
    this.initTextTracks(options.textTracks);
    clearTimeout(this.reTryVideo);
    this.nbCalls = 0;
    let maxTries = this.videojs.options_.maxTries || 3;
    let videoReadyTimeout = this.videojs.options_.videoTimeout || 55000;
    this.reTryVideo(maxTries, videoReadyTimeout);
    return this.videojs.cloudinary.source(publicId, options);
  }

  posterOptions(options) {
    return this.videojs.cloudinary.posterOptions(options);
  }

  skin(name) {
    if (name !== undefined && typeof name === 'string') {
      setSkinClassPrefix(this.videojs, name);

      if (this.playlistWidget()) {
        this.playlistWidget().setSkin();
      }
    }

    return skinClassPrefix(this.videojs);
  }

  playlist(sources, options = {}) {
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
      this.videojs.addClass('cld-fluid');
    } else {
      this.videojs.removeClass('cld-fluid');
    }

    this.videojs.fluid(bool);
    this.videojs.trigger('fluid', bool);
    return this;
  }

  play() {
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
