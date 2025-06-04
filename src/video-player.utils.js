import videojs from 'video.js';
import Utils from './utils';
import defaults from './config/defaults';
import {
  PLAYER_PARAMS,
  SOURCE_PARAMS,
  FLUID_CLASS_NAME,
  AUTO_PLAY_MODE
} from './video-player.const';
import isString from 'lodash/isString';

/*
* Used to escape element identifiers that begin with certain
* characters such as digits.
* https://www.w3.org/International/questions/qa-escapes#css_identifiers
*/
import cssEscape from 'css.escape';

export const addMetadataTrack = (videoJs, vttSource) => {
  return videoJs.addRemoteTextTrack({
    kind: 'metadata',
    srclang: 'en',
    src: vttSource,
    default: true
  }, true).track;
};

export const isLight = (opts) => {
  return opts.class.indexOf('cld-video-player-skin-light') > -1 || opts.skin === 'light';
};

export const getResolveVideoElement = (elem) => {
  if (isString(elem)) {
    let id = elem;

    // Adjust for jQuery ID syntax
    if (id.indexOf('#') === 0) {
      id = id.slice(1);
    }

    try {
      elem = document.querySelector(`#${cssEscape(id)}`) || videojs.getPlayer(id);
    } catch (err) { // eslint-disable-line no-unused-vars
      elem = null;
    }

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


export const normalizeAutoplay = (options) => {
  const autoplayMode = options.autoplayMode;
  if (autoplayMode) {
    switch (autoplayMode) {
      case AUTO_PLAY_MODE.ALWAYS:
        options.autoplay = true;
        break;
      case AUTO_PLAY_MODE.ON_SCROLL:
      case AUTO_PLAY_MODE.NEVER:
      default:
        options.autoplay = false;
    }
  }
};

export const extractOptions = (elem, options) => {
  const elemOptions = Utils.normalizeAttributes(elem);

  if (videojs.dom.hasClass(elem, FLUID_CLASS_NAME) || videojs.dom.hasClass(elem, 'vjs-fluid')) {
    options.fluid = true;
  }
  // Default options < Markup options < Player options
  options = videojs.obj.merge({}, defaults, elemOptions, options);

  // In case of 'autoplay on scroll', we need to make sure normal HTML5 autoplay is off
  normalizeAutoplay(options);

  // VideoPlayer specific options
  const playerOptions = Utils.sliceAndUnsetProperties(options, ...PLAYER_PARAMS);

  // Cloudinary plugin specific options
  playerOptions.cloudinary = Utils.sliceAndUnsetProperties(playerOptions, ...SOURCE_PARAMS);

  // Allow explicitly passing options to videojs using the `videojs` namespace, in order
  // to avoid param name conflicts:
  // VideoPlayer.new({ controls: true, videojs: { controls: false })
  if (options.videojs) {
    Object.assign(options, options.videojs);
    delete options.videojs;
  }

  return { playerOptions, videojsOptions: options };
};

export const overrideDefaultVideojsComponents = () => {
  const Player = videojs.getComponent('Player');
  let children = Player.prototype.options_.children;

  if (children.indexOf('titleBar') === -1) {
    children.push('titleBar');
  }

  const ControlBar = videojs.getComponent('ControlBar');
  if (ControlBar) {
    children = ControlBar.prototype.options_.children;
    // Add space instead of the progress control (which we detached from the controlBar, and absolutely positioned it above it)
    // Also add a blank div underneath the progress control to stop bubbling up pointer events.
    children.splice(children.indexOf('progressControl'), 0, 'spacer', 'progressControlEventsBlocker');

    // Add skip buttons around the 'play-toggle'
    children.splice(children.indexOf('playToggle'), 1, 'playToggle', 'JumpBackButton', 'JumpForwardButton');

    // Position the 'logo-button' button last
    children.push('logoButton');

    // Remove these button
    children.splice(children.indexOf('skipForward'), 1);
    children.splice(children.indexOf('skipBackward'), 1);
  }
};
