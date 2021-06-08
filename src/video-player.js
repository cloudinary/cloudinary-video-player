import videojs from 'video.js';
import isObj from 'is-obj';
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
import { createElement } from './utils/dom';
import { isFunction, isString, noop } from './utils/type-inference';
import {
  extractOptions,
  getMetaDataTracker,
  getResolveVideoElement,
  getTrackerItem,
  overrideDefaultVideojsComponents,
  setTrackersContainer
} from './video-player.utils';
import { TRACKERS_CONTAINER_CLASS_NAME } from './video-player.const';


// Register all plugins
Object.keys(plugins).forEach((key) => {
  videojs.registerPlugin(key, plugins[key]);
});

overrideDefaultVideojsComponents();

let _allowUsageReport = true;

class VideoPlayer extends Utils.mixin(Eventable) {

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

    this._isZoomed = false;
    this.unZoom = noop;
    this._playlistWidget = null;
    this.nbCalls = 0;

    const element = getResolveVideoElement(elem);
    this.options = extractOptions(element, initOptions);

    const vjsOptions = this.options.videojsOptions;

    // Make sure to add 'video-js' class before creating videojs instance
    element.classList.add('video-js');

    // Handle WebFont loading
    Utils.fontFace(element, this.playerOptions);

    // Handle play button options
    Utils.playButton(element, vjsOptions);

    // Dash plugin - available in full (not light) build only
    if (plugins.dashPlugin) {
      plugins.dashPlugin();
    }

    this.videojs = videojs(element, vjsOptions);

    if (vjsOptions.muted) {
      this.videojs.volume(0.4);
    }

    if (this.playerOptions.fluid) {
      this.fluid(this.playerOptions.fluid);
    }

    /* global google */
    const loaded = {
      contribAdsLoaded: isFunction(this.videojs.ads),
      imaAdsLoaded: (typeof google === 'object' && typeof google.ima === 'object')
    };

    this._setCssClasses();
    this._initPlugins(loaded);
    this._initPlaylistWidget();
    this._initJumpButtons();
    this._setVideoJsListeners(ready);
  }

  _setVideoJsListeners(ready) {

    this.videojs.on('error', () => {
      const error = this.videojs.error();
      if (error) {
        const type = this.videojs.cloudinary.currentSourceType();
        if (error.code === 4 && (type === 'VideoSource' || type === 'AudioSource')) {
          this.videojs.error(null);
          Utils.handleCldError(this, this.playerOptions);
        } else {
          this.videojs.clearTimeout(this.reTryId);
        }
      }
    });

    this.videojs.on('play', () => {
      this.videojs.clearTimeout(this.reTryId);
    });

    this.videojs.on('canplaythrough', () => {
      this.videojs.clearTimeout(this.reTryId);
    });

    this.videojs.ready(() => {
      this._onReady();

      if (ready) {
        ready(this);
      }

      this.videojs.on('ended', () => {
        this.unZoom();
      });
    });

    if (this.adsEnabled) {
      if (Object.keys(this.playerOptions.ads).length > 0 &&
          typeof this.videojs.ima === 'object') {
        if (this.playerOptions.ads.adsInPlaylist === 'first-video') {
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
  }

  _initPlugins (loaded) {
    // #if (!process.env.WEBPACK_BUILD_LIGHT)
    this.adsEnabled = this._initIma(loaded);
    // #endif
    this._initAutoplay();
    this._initContextMenu();
    this._initPerSrcBehaviors();
    this._initCloudinary();
    this._initAnalytics();
    this._initFloatingPlayer();
    this._initColors();
    this._initTextTracks();
    this._initSeekThumbs();
  }

  _initIma (loaded) {
    if (!loaded.contribAdsLoaded || !loaded.imaAdsLoaded) {
      if (this.playerOptions.ads) {
        if (!loaded.contribAdsLoaded) {
          console.log('contribAds is not loaded');
        }
        if (!loaded.imaAdsLoaded) {
          console.log('imaSdk is not loaded');
        }
      }

      return false;
    }

    if (!this.playerOptions.ads) {
      this.playerOptions.ads = {};
    }
    const opts = this.playerOptions.ads;

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

      this.videojs.on('cldsourcechanged', (e, { source }) => {
        // Bail if...
        if (source.getType() === 'AudioSource' || // it's an audio player
            (this.videojs && this.videojs.activePlugins_ && this.videojs.activePlugins_.vr) // It's a VR (i.e. 360) video
        ) {
          return;
        }

        const cloudinaryConfig = source.cloudinaryConfig();
        const publicId = source.publicId();

        const transformations = source.transformation().toOptions();

        if (transformations && transformations.streaming_profile) {
          delete transformations.streaming_profile;
        }

        transformations.flags = transformations.flags || [];
        transformations.flags.push('sprite');

        // build VTT url
        const vttSrc = cloudinaryConfig.video_url(publicId + '.vtt', { transformation: transformations });

        // vttThumbnails must be called differently on init and on source update.
        if (isFunction(this.videojs.vttThumbnails)) {
          this.videojs.vttThumbnails({ src: vttSrc });
        } else {
          this.videojs.vttThumbnails.src(vttSrc);
        }
      });
    }
  }

  _initColors () {
    this.videojs.colors(this.playerOptions.colors ? { 'colors': this.playerOptions.colors } : {});
  }

  // #if (!process.env.WEBPACK_BUILD_LIGHT)
  _initQualitySelector() {
    if (this.playerOptions.qualitySelector !== false) {
      if (videojs.browser.IE_VERSION === null) {
        this.videojs.httpSourceSelector({ default: 'auto' });
      }

      this.videojs.on('loadedmetadata', () => {
        qualitySelector.init(this.videojs);
      });

      // Show only if more then one option available
      this.videojs.on('loadeddata', () => {
        qualitySelector.setVisibility(this.videojs);
      });
    }
  }
  // #endif

  _initTextTracks () {
    this.videojs.on('refreshTextTracks', (e, tracks) => {
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
    const opts = this.playerOptions.cloudinary;
    opts.chainTarget = this;
    if (opts.secure !== false) {
      this.playerOptions.cloudinary.cloudinaryConfig.config('secure', true);
    }

    this.videojs.cloudinary(this.playerOptions.cloudinary);
  }

  _initAnalytics() {
    const analyticsOpts = this.playerOptions.analytics;

    if (analyticsOpts) {
      const opts = typeof analyticsOpts === 'object' ? analyticsOpts : {};
      this.videojs.analytics(opts);
    }
  }

  reTryVideo(maxNumberOfCalls, timeout) {
    if (!this.isVideoReady()) {
      if (this.nbCalls < maxNumberOfCalls) {
        this.nbCalls++;
        this.reTryId = this.videojs.setTimeout(this.reTryVideo, timeout);
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
    this.videojs.on('playlistcreated', () => {

      if (this._playlistWidget) {
        this._playlistWidget.dispose();
      }
      const plwOptions = this.playerOptions.playlistWidget;

      if (isObj(plwOptions)) {
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

    if (isObj(options)) {
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
    if (this.playerOptions.floatingWhenNotVisible) {
      this.videojs.floatingPlayer({ 'floatTo': this.playerOptions.floatingWhenNotVisible });
    }
  }

  _setCssClasses() {
    this.videojs.addClass(Utils.CLASS_PREFIX);
    this.videojs.addClass(Utils.playerClassPrefix(this.videojs));

    Utils.setSkinClassPrefix(this.videojs, Utils.skinClassPrefix(this.videojs));

    if (videojs.browser.IE_VERSION === 11) {
      this.videojs.addClass('cld-ie11');
    }
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
        type: 'percentsplayed',
        percents: this.playerOptions.playedEventPercents
      });
    }

    if (this.playerOptions.playedEventTimes) {
      events.push({
        type: 'timeplayed',
        times: this.playerOptions.playedEventTimes
      });
    }

    events.push(...['seek', 'mute', 'unmute', 'qualitychanged']);

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

  _setGoBackButton() {
    const button = createElement('button', { 'class': 'go-back-button' }, 'Go back');

    button.addEventListener('click', () => {
      this.unZoom();
    }, false);

    const tracksContainer = createElement('div', { 'class': TRACKERS_CONTAINER_CLASS_NAME }, button);
    setTrackersContainer(this.videojs, tracksContainer);
  }

  addInteractionAreas(interactionAreas, trackersOptions) {
    this.unZoom = () => {
      if (this._isZoomed) {
        this._isZoomed = false;
        this.source(this.prvSrc).play();
        this._addTrackersItems(interactionAreas, trackersOptions);
      }
    };

    this._addTrackersItems(interactionAreas, trackersOptions);
  }

  _addTrackersItems(trackersData, trackersOptions) {
    const trackerItems = trackersData.map((item, index) => {
      return getTrackerItem(item, (event) => {
        this._isZoomed = true;
        this.prvSrc = this.currentSourceUrl();
        this._setGoBackButton();
        trackersOptions && trackersOptions.onClick({ item, index, event });
      });
    });

    const tracksContainer = createElement('div', { 'class': TRACKERS_CONTAINER_CLASS_NAME }, trackerItems);

    setTrackersContainer(this.videojs, tracksContainer);
  }

  addCueListener() {
    const textTracks = this.videojs.textTracks();
    if (!textTracks.length) {
      return;
    }

    const track = getMetaDataTracker(textTracks);

    if (!track) {
      return;
    }

    track.mode = 'hidden';

    track.addEventListener('cuechange', () => {
      const tracksData = JSON.parse(track.activeCues[0].text);
      this._addTrackersItems(tracksData);
    });
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

    this.setTextTracks(options.textTracks);
    // #if (!process.env.WEBPACK_BUILD_LIGHT)
    this._initQualitySelector();
    // #endif
    clearTimeout(this.reTryId);
    this.nbCalls = 0;
    const maxTries = this.videojs.options_.maxTries || 3;
    const videoReadyTimeout = this.videojs.options_.videoTimeout || 55000;
    this.reTryVideo(maxTries, videoReadyTimeout);
    return this.videojs.cloudinary.source(publicId, options);
  }

  posterOptions(options) {
    return this.videojs.cloudinary.posterOptions(options);
  }

  skin(name) {
    if (name !== undefined && isString(name)) {
      Utils.setSkinClassPrefix(this.videojs, name);

      const playlistWidget = this.playlistWidget();

      if (this.playlistWidget()) {
        playlistWidget.setSkin();
      }
    }

    return Utils.skinClassPrefix(this.videojs);
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
