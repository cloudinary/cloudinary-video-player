import videojs from 'video.js';
import {
  CLOSE_INTERACTION_AREA_LAYOUT_DELAY,
  DEFAULT_INTERACTION_ARE_TRANSITION,
  INTERACTION_AREAS_CONTAINER_CLASS_NAME, TEMPLATE_INTERACTION_AREAS_VTT
} from './interaction-area.const';
import {
  createInteractionAreaLayoutMessage,
  getInteractionAreaItem,
  getZoomTransformation,
  removeInteractionAreasContainer,
  setInteractionAreasContainer,
  setInteractionAreasContainerSize,
  shouldShowAreaLayoutMessage,
  updateInteractionAreasItem
} from './interaction-area.utils';
import { addEventListener, createElement } from '../../utils/dom';
import { throttle } from '../../utils/time';
import { get } from '../../utils/object';
import { noop } from '../../utils/type-inference';
import { addMetadataTrack } from '../../video-player.utils';
import { PLAYER_EVENT } from '../../utils/consts';


export const interactionAreaService = (player, playerOptions, videojsOptions) => {

  let isZoomed = false;
  let currentTrack = null;
  let unZoom = noop;

  const shouldLayoutMessage = () => shouldShowAreaLayoutMessage(videojsOptions.interactionDisplay);

  const getIsSyncOffsetTime = () => {
    const interactionAreasConfig = getInteractionAreasConfig();
    return (interactionAreasConfig && interactionAreasConfig.syncOffsetTime !== undefined) ? interactionAreasConfig.syncOffsetTime : false;
  };

  function isInteractionAreasEnabled(enabled = false) {
    const interactionAreasConfig = getInteractionAreasConfig();
    return enabled || (interactionAreasConfig && interactionAreasConfig.enable);
  }

  function setAreasPositionListener() {
    currentTrack && player.videojs.removeRemoteTextTrack(currentTrack);

    const isEnabled = isInteractionAreasEnabled();
    const interactionAreasConfig = getInteractionAreasConfig();

    if (!isEnabled || isZoomed) {
      return null;
    }

    if (Array.isArray(interactionAreasConfig.template)) {
      addInteractionAreasItems(interactionAreasConfig.template);
      setContainerSize();
    } else {
      const vttUrl = interactionAreasConfig.vttUrl || TEMPLATE_INTERACTION_AREAS_VTT[interactionAreasConfig.template];

      if (vttUrl) {
        currentTrack = addMetadataTrack(player.videojs, vttUrl);
        addCueListener(currentTrack);
      }
    }
  }

  function setGoBackButton() {
    const button = createElement('div', { 'class': 'go-back-button' });

    button.addEventListener('click', () => {
      unZoom();
    }, false);

    const tracksContainer = createElement('div', { 'class': INTERACTION_AREAS_CONTAINER_CLASS_NAME }, button);
    setInteractionAreasContainer(player.videojs, tracksContainer);
  }

  function getInteractionAreasConfig() {
    const { cldSrc } = player.videojs.currentSource();
    return cldSrc && cldSrc.getInteractionAreas();
  }

  function removeLayoutMessage() {
    removeInteractionAreasContainer(player.videojs);
    setAreasPositionListener();
    player.play();
  }

  function setLayoutMessage() {
    if (!isInteractionAreasEnabled()) {
      return;
    }

    if (shouldLayoutMessage()) {
      let layoutMessageTimout = null;
      const showItAgainCheckbox = get(videojsOptions, 'interactionDisplay.layout.showAgain', false);
      player.pause();

      createInteractionAreaLayoutMessage(player.videojs, () => {
        clearTimeout(layoutMessageTimout);
        removeLayoutMessage();
      }, showItAgainCheckbox);

      if (!showItAgainCheckbox) {
        layoutMessageTimout = setTimeout(removeLayoutMessage, CLOSE_INTERACTION_AREA_LAYOUT_DELAY);
      }
    } else {
      removeLayoutMessage();
    }
  }

  function handleAds() {
    player.on('adsready', () => {
      player.videojs.ima.addEventListener(window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED, setLayoutMessage);
    });
  }

  function init() {

    if (isInteractionAreasEnabled()) {

      player.videojs.el().classList.add('interaction-areas');

      player.videojs.one(PLAYER_EVENT.PLAY, () => {
        if (typeof player.videojs.ima === 'object') {
          handleAds();
        } else {
          setLayoutMessage();
        }
      });

      const setInteractionAreasContainerSize = throttle(setContainerSize, 100);

      player.videojs.on(PLAYER_EVENT.FULL_SCREEN_CHANGE, () => {
        // waiting for fullscreen will end
        setTimeout(setInteractionAreasContainerSize, 100);
      });

      const resizeDestroy = addEventListener(window, 'resize', setContainerSize, false);

      player.videojs.on(PLAYER_EVENT.DISPOSE, resizeDestroy);
    }

    player.videojs.on(PLAYER_EVENT.ENDED, () => {
      unZoom();
    });

    player.videojs.on(PLAYER_EVENT.ERROR, () => {
      player.pause();
    });
  }

  function onZoom(src, newOption, item) {
    const currentSource = player.videojs.currentSource();
    const originalCurrentTime = player.currentTime();
    const isSyncOffsetTime = getIsSyncOffsetTime();
    const { cldSrc } = currentSource;
    const currentSrcOptions = cldSrc.getInitOptions();
    const option = newOption || { transformation: currentSrcOptions.transformation };
    const transformation = !src && getZoomTransformation(player.videoElement, item);
    const sourceOptions = transformation ? videojs.mergeOptions({ transformation }, option) : option;

    const newSource = cldSrc.isRawUrl ? currentSource.src : { publicId: cldSrc.publicId() };
    player.source(transformation ? { publicId: cldSrc.publicId() } : src, sourceOptions).play();
    isSyncOffsetTime && player.currentTime(originalCurrentTime);

    isZoomed = true;

    setGoBackButton();

    unZoom = () => {
      if (isZoomed) {
        isZoomed = false;
        const currentZoomedTime = player.currentTime();
        const duration = player.duration();
        player.source(newSource, currentSrcOptions).play();
        isSyncOffsetTime && currentZoomedTime < duration && player.currentTime(currentZoomedTime);
        setAreasPositionListener();
      }
    };
  }

  function onInteractionAreasClick({ event, item, index }) {
    const interactionAreasConfig = getInteractionAreasConfig();

    interactionAreasConfig.onClick && interactionAreasConfig.onClick({
      item,
      index,
      event,
      zoom: (source, option) => {
        onZoom(source, option, item);
      }
    });
  }

  function addInteractionAreasItems(interactionAreasData, previousInteractionAreasData, durationTime = 0) {
    const configs = { playerOptions: playerOptions, videojsOptions: videojsOptions };

    if (previousInteractionAreasData) {
      updateInteractionAreasItem(player.videojs, configs, interactionAreasData, previousInteractionAreasData, durationTime, onInteractionAreasClick);
    } else {
      const interactionAreasItems = interactionAreasData.map((item, index) => {
        return getInteractionAreaItem(configs, item, index, durationTime, (event) => {
          onInteractionAreasClick({ event, item, index });
        });
      });

      setInteractionAreasContainer(player.videojs, createElement('div', { 'class': INTERACTION_AREAS_CONTAINER_CLASS_NAME }, interactionAreasItems));
    }
  }

  function setContainerSize() {
    if (isInteractionAreasEnabled()) {
      setInteractionAreasContainerSize(player.videojs, player.videoElement);
    }
  }

  function addCueListener(track) {
    if (!track) {
      return;
    }

    let previousTracksData = null;

    track.addEventListener('cuechange', () => {
      const activeCue = track.activeCues && track.activeCues[0];

      if (activeCue) {
        const durationTime = Math.max(Math.floor((activeCue.endTime - activeCue.startTime) * 1000), DEFAULT_INTERACTION_ARE_TRANSITION);

        const tracksData = JSON.parse(activeCue.text);

        addInteractionAreasItems(tracksData, previousTracksData, durationTime);
        !previousTracksData && setContainerSize();
        previousTracksData = tracksData;
      } else {
        removeInteractionAreasContainer(player.videojs);
        previousTracksData = null;
      }
    });
  }

  return {
    init
  };

};
