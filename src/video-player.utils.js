import { createElement } from './utils/dom';
import videojs from 'video.js';
import Utils from './utils';
import defaults from './config/defaults';
import {
  CLOUDINARY_PARAMS,
  DEFAULT_HLS_OPTIONS,
  PLAYER_PARAMS,
  TRACKERS_CONTAINER_CLASS_NAME
} from './video-player.const';
import { isString } from './utils/type-inference';

export const getMetaDataTracker = (textTracks) => {
  for (let i = 0; textTracks.length; i++) {
    const value = textTracks[i];
    if (value.kind === 'metadata') {
      return value;
    }
  }
};


export const setTrackersContainer = (videojs, newTracksContainer) => {
  const videoContainer = videojs.el();
  const currentTracksElementContainer = videoContainer.querySelector(`.${TRACKERS_CONTAINER_CLASS_NAME}`);

  if (currentTracksElementContainer) {
    currentTracksElementContainer.replaceWith(newTracksContainer);
  } else {
    videoContainer.append(newTracksContainer);
  }
};


export const getTrackerItem = (item, onClick) => {
  const element = createElement('div', { class: 'video-player-tracker' });
  element.style.left = `${item.left}%`;
  element.style.top = `${item.top}%`;
  element.style.width = `${item.width}%`;
  element.style.height = `${item.height}%`;

  element.addEventListener('click', onClick, false);

  return element;
};


export const getResolveVideoElement = (elem) => {
  if (isString(elem)) {
    let id = elem;

    // Adjust for jQuery ID syntax
    if (id.indexOf('#') === 0) {
      id = id.slice(1);
    }

    try {
      elem = document.querySelector(`#${id}`) || videojs.getPlayer(id);
    } catch (e) {
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

export const extractOptions = (elem, options) => {
  const elemOptions = Utils.normalizeAttributes(elem);

  if (videojs.dom.hasClass(elem, 'cld-fluid') || videojs.dom.hasClass(elem, 'vjs-fluid')) {
    options.fluid = true;
  }

  // Default HLS options < Default options < Markup options < Player options
  options = Utils.assign({}, DEFAULT_HLS_OPTIONS, defaults, elemOptions, options);

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
    Utils.assign(options, options.videojs);
    delete options.videojs;
  }

  return { playerOptions, videojsOptions: options };
};

export const overrideDefaultVideojsComponents = () => {
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
    children.splice(children.indexOf('progressControl'), 0, 'spacer', 'progressControlEventsBlocker');

    // Add 'play-previous' and 'play-next' buttons around the 'play-toggle'
    children.splice(children.indexOf('playToggle'), 1, 'playlistPreviousButton', 'JumpBackButton', 'playToggle', 'JumpForwardButton', 'playlistNextButton');

    // Position the 'logo-button' button right next to 'fullscreenToggle'
    children.splice(children.indexOf('fullscreenToggle'), 1, 'logoButton', 'fullscreenToggle');
  }
};
