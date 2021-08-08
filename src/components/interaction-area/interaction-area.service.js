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


export const interactionAreaService = (player, playerOptions, videojsOptions) => {

  let firstPlayed = false;
  let isZoomed = false;
  let setStaticInteractionAreas = null;
  let currentTrack = null;
  let unZoom = noop;

  const shouldSetResize = () => isInteractionAreasEnabled(setStaticInteractionAreas);
  const shouldLayoutMessage = () => shouldShowAreaLayoutMessage(videojsOptions.interactionAreas);

  function isInteractionAreasEnabled(enabled = false) {
    const interactionAreasConfig = getInteractionAreasConfig();

    return enabled || (interactionAreasConfig && interactionAreasConfig.enable);
  }

  function updateTrack() {
    currentTrack && player.videojs.removeRemoteTextTrack(currentTrack);

    if (!isInteractionAreasEnabled()) {
      return;
    }

    const interactionAreasConfig = getInteractionAreasConfig();

    const vttUrl = interactionAreasConfig.vttUrl || TEMPLATE_INTERACTION_AREAS_VTT[interactionAreasConfig.template];

    currentTrack && player.videojs.removeRemoteTextTrack(currentTrack);

    if (!isZoomed && interactionAreasConfig.enable && vttUrl) {
      currentTrack = addMetadataTrack(player.videojs, vttUrl);
      addCueListener(interactionAreasConfig, currentTrack);
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

  function addInteractionAreas(interactionAreas, interactionAreasOptions) {
    setStaticInteractionAreas = () => {
      addInteractionAreasItems(interactionAreas, interactionAreasOptions);
      _setInteractionAreasContainerSize();
    };
  }

  function getInteractionAreasConfig() {
    const { cldSrc } = player.videojs.currentSource();
    return cldSrc && cldSrc.getInteractionAreas();
  }

  function _removeInteractionAreaLayoutMessage() {
    removeInteractionAreasContainer(player.videojs);
    updateTrack();
    setStaticInteractionAreas && setStaticInteractionAreas();
    player.play();
  }

  function setLayoutMessage() {
    if (!isInteractionAreasEnabled(setStaticInteractionAreas)) {
      return;
    }

    if (shouldLayoutMessage()) {
      let layoutMessageTimout = null;
      const showItAgainCheckbox = get(videojsOptions, 'interactionAreas.layout.showAgain', false);
      player.pause();

      createInteractionAreaLayoutMessage(player.videojs, () => {
        clearTimeout(layoutMessageTimout);
        _removeInteractionAreaLayoutMessage();
      }, showItAgainCheckbox);

      if (!showItAgainCheckbox) {
        layoutMessageTimout = setTimeout(_removeInteractionAreaLayoutMessage, CLOSE_INTERACTION_AREA_LAYOUT_DELAY);
      }
    } else {
      _removeInteractionAreaLayoutMessage();
    }
  }

  function init() {

    player.videojs.one('play', () => {
      firstPlayed = true;
      setLayoutMessage();
    });

    player.videojs.on('sourcechanged', () => {
      firstPlayed && updateTrack();
    });

    if (shouldSetResize()) {

      const setInteractionAreasContainerSize = throttle(_setInteractionAreasContainerSize, 100);

      player.videojs.on('fullscreenchange', () => {
        // waiting for fullscreen will end
        setTimeout(setInteractionAreasContainerSize, 100);
      });

      const resizeDestroy = addEventListener(window, 'resize', _setInteractionAreasContainerSize, false);

      player.videojs.on('dispose', resizeDestroy);
    }

    player.videojs.on('ended', () => {
      unZoom();
    });
  }

  function onZoom(src, newOption, item) {
    const currentSource = player.videojs.currentSource();
    const { cldSrc } = currentSource;
    const currentSrcOptions = cldSrc.getInitOptions();
    const option = newOption || { transformation: currentSrcOptions.transformation.toOptions() };
    const transformation = !src && getZoomTransformation(player.videoElement, item);
    const sourceOptions = transformation ? videojs.mergeOptions({ transformation }, option) : option;

    const newSource = cldSrc.isRawUrl ? currentSource.src : { publicId: cldSrc.publicId() };
    player.source(transformation ? { publicId: cldSrc.publicId() } : src, sourceOptions).play();

    isZoomed = true;

    setGoBackButton();

    unZoom = () => {
      if (isZoomed) {
        isZoomed = false;
        setStaticInteractionAreas && setStaticInteractionAreas();
        player.source(newSource, currentSrcOptions).play();
      }
    };
  }

  function onInteractionAreasClick(interactionAreasOptions, { event, item, index }) {
    interactionAreasOptions.onClick && interactionAreasOptions.onClick({
      item,
      index,
      event,
      zoom: (source, option) => {
        onZoom(source, option, item);
      }
    });
  }

  function addInteractionAreasItems(interactionAreasData, interactionAreasOptions = {}, previousInteractionAreasData, durationTime = 0) {
    const configs = { playerOptions: playerOptions, videojsOptions: videojsOptions };

    if (previousInteractionAreasData) {
      updateInteractionAreasItem(player.videojs, configs, interactionAreasData, previousInteractionAreasData, durationTime, ({ event, item, index }) => {
        onInteractionAreasClick(interactionAreasOptions, { event, item, index });
      });
    } else {
      const interactionAreasItems = interactionAreasData.map((item, index) => {
        return getInteractionAreaItem(configs, item, index, durationTime, (event) => {
          onInteractionAreasClick(interactionAreasOptions, { event, item, index });
        });
      });

      setInteractionAreasContainer(player.videojs, createElement('div', { 'class': INTERACTION_AREAS_CONTAINER_CLASS_NAME }, interactionAreasItems));
    }
  }

  function _setInteractionAreasContainerSize() {
    if (shouldSetResize()) {
      setInteractionAreasContainerSize(player.videojs, player.videoElement);
    }
  }

  function addCueListener(interactionAreasConfig, track) {
    if (!track) {
      return;
    }

    let previousTracksData = null;

    track.addEventListener('cuechange', () => {
      const activeCue = track.activeCues && track.activeCues[0];

      if (activeCue) {
        const durationTime = Math.max(Math.floor((activeCue.endTime - activeCue.startTime) * 1000), DEFAULT_INTERACTION_ARE_TRANSITION);

        const tracksData = JSON.parse(activeCue.text);

        addInteractionAreasItems(tracksData, interactionAreasConfig, previousTracksData, durationTime);
        !previousTracksData && _setInteractionAreasContainerSize();
        previousTracksData = tracksData;
      } else {
        removeInteractionAreasContainer(player.videojs);
        previousTracksData = null;
      }
    });
  }

  return {
    init,
    addInteractionAreas
  };

};
