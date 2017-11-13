import videojs from 'video.js';
import './components';
import * as plugins from 'plugins';
import * as Utils from 'utils';
import assign from 'utils/assign';
import { find } from 'utils/find';
import defaults from 'config/defaults';
import Eventable from 'mixins/eventable';
import ExtendedEvents from 'extended-events';
import normalizeAttributes from './attributes-normalizer';
import PlaylistWidget from './components/playlist/playlist-widget';


const dom = videojs.dom || videojs;
const CLOUDINARY_PARAMS = [
  'cloudinaryConfig', 
  'transformation', 
  'sourceTypes', 
  'sourceTransformation', 
  'posterOptions', 
  'autoShowRecommendations', 
  'playlistOptions'
];
const PLAYER_PARAMS = CLOUDINARY_PARAMS.concat(['publicId', 'source', 'autoplayMode',
  'playedEventPercents', 'playedEventTimes', 'analytics', 'fluid']);
const VALID_SKINS = ['dark', 'light'];
const CLASS_PREFIX = 'cld-video-player';

const registerPlugin = videojs.plugin;

// Register all plugins
Object.keys(plugins).forEach((key) => {
  registerPlugin(key, plugins[key]);
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

  if (videojs.hasClass(elem, 'cld-fluid')) {
    options.fluid = true;
  }

  // Default options < Markup options < Player options
  options = assign({}, defaults, elemOptions, options);

  // In case of 'autoplay on scroll', we need to make sure normal HTML5 autoplay is off
  normalizeAutoplay(options);

  // VideoPlayer specific options
  const playerOptions = Utils.sliceAndUnsetProperties(options, ...PLAYER_PARAMS);

  // Cloudinary plugin specific options
  playerOptions.cloudinary = Utils.sliceAndUnsetProperties(playerOptions, ...CLOUDINARY_PARAMS);

  // Allow explicitly passing options to videojs using the `videojs` namespace, in order
  // to avoid param name conflicts:
  // VideoPlayer.new({ controls: true, videojs: { controls: false })
  if (options.videojs) {
    assign(options, options.videojs);
    delete options.videojs;
  }

  return { playerOptions, videojsOptions: options };
};

const cssClassFromSkin = (skin) => `${CLASS_PREFIX}-skin-${skin}`;

const overrideDefaultVideojsComponents = () => {
  const Player = videojs.getComponent('Player');
  let children = Player.prototype.options_.children;

  // Add TitleBar as default
  children.push('titleBar');
  children.push('upcomingVideoOverlay');
  children.push('recommendationsOverlay');
  //children.push('playlist');
  const ControlBar = videojs.getComponent('ControlBar');
  children = ControlBar.prototype.options_.children;

  // Add our custom TriangleVolumeMenuButton
  children[children.indexOf('volumeMenuButton')] = 'triangleVolumeMenuButton';

  // Add space instead of the progress control (which we deattached from the controlBar, and absolutely positioned it above it)
  children.splice(children.indexOf('progressControl'), 0, 'spacer');

  // Add 'play-previous' and 'play-next' buttons around the 'play-toggle'
  children.splice(children.indexOf('playToggle'), 1, 'playlistPreviousButton', 'playToggle', 'playlistNextButton');
};


overrideDefaultVideojsComponents();

class VideoPlayer extends Utils.mixin(Eventable) {
  constructor(elem, options, ready) {
    super();

    elem = resolveVideoElement(elem);
    options = extractOptions(elem, options);

    const onReady = () => {
      setExtendedEvents();
      setCssClasses();
      
      this.fluid(_options.fluid);
      // Load first video (mainly to support video tag 'source' and 'public-id' attributes)
      const source = _options.source || _options.publicId;
      if (source) {
        this.source(source);
      }
    };


    const setExtendedEvents = () => {
      const events = [];
      if (_options.playedEventPercents) {
        const percentsplayed = { type: 'percentsplayed', percents: _options.playedEventPercents };
        events.push(percentsplayed);
      }

      if (_options.playedEventTimes) {
        const timeplayed = { type: 'timeplayed', times: _options.playedEventTimes };
        events.push(timeplayed);
      }

      events.push(...['seek', 'mute', 'unmute']);

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

      const currentSkin = find(VALID_SKINS, (s) => this.videojs.hasClass(cssClassFromSkin(s)));

      if (!currentSkin) {
        this.videojs.addClass(cssClassFromSkin(defaults.skin));
      }
    };

    const initPlugins = () => {
      initAutoplay();
      initContextMenu();
      initPerSrcBehaviors();
      initCloudinary();
      initAnalytics();
    };

    const initAutoplay = () => {
      const autoplayMode = _options.autoplayMode;

      if (autoplayMode === 'on-scroll') {
        this.videojs.autoplayOnScroll();
      }
    };

    const initContextMenu = () => {
      this.videojs.contextMenu(defaults.contextMenu);
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

    const initPlaylist = () => {
      this.videojs.on("playlistcreated", () => {
          const plOptions = this.videojs.cloudinary.playlistOptions();

          if(!Utils.isEmpty(plOptions)) {
              this.playlistWidget_ = new PlaylistWidget(this.videojs, { fluid: options.playerOptions.fluid, ...plOptions});
          }
        
          // if(PlaylistLayout.isRender(plOptions) && !this.playlistLayout ) {
          //   this.playlistLayout = new PlaylistLayout(this.videojs, plOptions);
          // }
      });
    }
 
    const _options = options.playerOptions;
    const _vjs_options = options.videojsOptions;
    console.log(_options, _vjs_options);

    // Make sure to add 'video-js' class before creating videojs instance
    Utils.addClass(elem, 'video-js');

    this.videojs = videojs(elem, _vjs_options);
    initPlugins();
    initPlaylist();

    // TODO: END

    this.videojs.ready(() => {
      onReady();
      

      if (ready) {
        ready(this);
      }
    });
  }

  static all(selector, ...args) {
    const nodeList = document.querySelectorAll(selector);
    const players = [];

    for (let i = 0; i < nodeList.length; i++) {
      players.push(new VideoPlayer(nodeList[i], ...args));
    }

    return players;
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
    return this.videojs.cloudinary.source(publicId, options);
  }

  
  posterOptions(options) {
    return this.videojs.cloudinary.posterOptions(options);
  }

  playlist(sources, options = {}) {
    return this.videojs.cloudinary.playlist(sources, options);
  }


  playlistByTag(tag, options = {}) {
    return this.videojs.cloudinary.playlistByTag(tag, options);
  }

  playlistWidget() {
      return this.playlistWidget_;
  }

  playlistOptions(options) {
    return this.videojs.cloudinary.playlistOptions(options);
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
    this.videojs.trigger("fluid", bool);
    return this;
  }

  changeSkin(skin) {
      if(skin === "dark" || skin === "light") {
        const prevSkin = this.videojs.options().skin;

        this.videojs.removeClass('cld-video-player-skin-' + prevSkin);
        this.videojs.addClass('cld-video-player-skin-' + skin);
        this.videojs.options({ skin: skin });
        this.videojs.trigger("themechange", { currSkin: skin, prevSkin: prevSkin })
      }
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

  playItem(item) {
    this.playlist().playItem(item);
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

  loop(bool) {
    if (bool === undefined) {
      return this.videojs.loop();
    }

    this.videojs.controls(bool);

    return this;
  }

  el() {
    return this.videojs.el();
  }
}

export default VideoPlayer;
