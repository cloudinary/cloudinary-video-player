import { elementsCreator, styleElement } from '../../utils/dom';
import {
  INTERACTION_AREA_LAYOUT_LOCAL_STORAGE_NAME,
  INTERACTION_AREAS_CONTAINER_CLASS_NAME,
  INTERACTION_AREAS_PREFIX
} from './interaction-area.const';
import { forEach, some } from '../../utils/array';

export const getInteractionAreaItem = (playerOptions, item, onClick) => {
  return elementsCreator({
    tag: 'div',
    attr: { class: `${INTERACTION_AREAS_PREFIX}-item`, 'data-id': item.id },
    style: {
      left: `${item.left}%`,
      top: `${item.top}%`,
      width: `${item.width}%`,
      height: `${item.height}%`
    },
    event: {
      name: 'click',
      callback: onClick
    },
    children: [
      {
        tag: 'div',
        attr: { class: `${INTERACTION_AREAS_PREFIX}-area-marker` },
        children: [
          {
            tag: 'div',
            attr: { class: `${INTERACTION_AREAS_PREFIX}-marker-shadow` },
            style: playerOptions && playerOptions.colors && { backgroundColor: playerOptions.colors.accent }
          },
          {
            tag: 'div',
            attr: { class: `${INTERACTION_AREAS_PREFIX}-marker-main` },
            style: playerOptions && playerOptions.colors && { borderColor: playerOptions.colors.accent }
          }
        ]
      }
    ]
  });
};


export const percentageToFixedValue = (outOf, value) => (outOf / (100 / +value));

export const getZoomTransformation = (videoElement, interactionAreaItem) => {

  const { videoHeight, videoWidth } = videoElement;

  const itemX = percentageToFixedValue(videoWidth, interactionAreaItem.left);
  const itemY = percentageToFixedValue(videoHeight, interactionAreaItem.top);
  const itemWidth = percentageToFixedValue(videoWidth, interactionAreaItem.width);
  const itemHeight = percentageToFixedValue(videoHeight, interactionAreaItem.height);

  const videoAspectRatio = videoWidth / videoHeight;
  const itemAspectRatio = itemWidth / itemHeight;

  const width = Math.round(itemAspectRatio > 1 || videoAspectRatio > 1 ? itemHeight * itemAspectRatio : itemWidth);
  const height = Math.round(width / videoAspectRatio);

  const x = Math.round(itemX - (width - itemWidth) / 2);
  const y = Math.round(itemY - (height - itemHeight) / 2);

  return {
    width,
    height,
    x: Math.min(Math.max(x, 0), videoWidth - width),
    y: Math.min(Math.max(y, 0), videoHeight - height),
    crop: 'crop'
  };
};


export const setInteractionAreasContainer = (videojs, newInteractionAreasContainer) => {
  const videoContainer = videojs.el();
  const currentInteractionAreasContainer = videoContainer.querySelector(`.${INTERACTION_AREAS_CONTAINER_CLASS_NAME}`);

  if (currentInteractionAreasContainer) {
    currentInteractionAreasContainer.replaceWith(newInteractionAreasContainer);
  } else {
    videoContainer.append(newInteractionAreasContainer);
  }
};

const getInteractionAreaElementById = (interactionAreasContainer, id) => interactionAreasContainer.querySelector(`[data-id=${id}]`);

export const updateInteractionAreasItem = (videojs, playerOptions, interactionAreasData, previousInteractionAreasData, onClick) => {
  const interactionAreasContainer = videojs.el().querySelector(`.${INTERACTION_AREAS_CONTAINER_CLASS_NAME}`);

  forEach(interactionAreasData, (item, index) => {
    const itemElement = getInteractionAreaElementById(interactionAreasContainer, item.id);
    const isExistItem = some(previousInteractionAreasData, i => i.id === item.id);

    if (isExistItem && itemElement) {
      styleElement(itemElement, {
        left: `${item.left}%`,
        top: `${item.top}%`,
        width: `${item.width}%`,
        height: `${item.height}%`
      });
    } else if (!isExistItem && !itemElement) {
      interactionAreasContainer.append(getInteractionAreaItem(playerOptions, item, (event) => {
        onClick({ event, item, index });
      }));
    }
  });

  forEach(previousInteractionAreasData, (item) => {
    const itemElement = getInteractionAreaElementById(interactionAreasContainer, item.id);
    const shouldBeRemoved = !some(interactionAreasData, i => i.id === item.id);

    if (itemElement && shouldBeRemoved) {
      itemElement.remove();
    }
  });

};

export const removeInteractionAreasContainer = (videojs) => {
  const interactionAreasContainer = videojs.el().querySelector(`.${INTERACTION_AREAS_CONTAINER_CLASS_NAME}`);
  interactionAreasContainer && interactionAreasContainer.remove();
};

export const shouldShowAreaLayoutMessage = (interactionLayoutConfig) => {
  return (!interactionLayoutConfig || interactionLayoutConfig.enable) && localStorage.getItem(INTERACTION_AREA_LAYOUT_LOCAL_STORAGE_NAME) !== 'true';
};

export const createInteractionAreaLayoutMessage = (videojs, onClick) => {

  let checked = false;

  const id = `checkbox_${Math.round(Math.random() * 10000)}`;

  const tracksContainer = elementsCreator({
    tag: 'div',
    attr: { class: INTERACTION_AREAS_CONTAINER_CLASS_NAME },
    children: [
      {
        tag: 'div',
        attr: { class: `${INTERACTION_AREAS_PREFIX}-layout-message` },
        children: [
          {
            tag: 'h3',
            attr: { class: `${INTERACTION_AREAS_PREFIX}-layout-message-title` },
            children: 'Tap on dots to zoom for a product.'
          },
          {
            tag: 'button',
            attr: { class: `${INTERACTION_AREAS_PREFIX}-layout-message-button` },
            children: 'Got it',
            event: {
              name: 'click',
              callback: () => {
                localStorage.setItem(INTERACTION_AREA_LAYOUT_LOCAL_STORAGE_NAME, JSON.parse(checked));
                onClick();
              }
            }
          },
          {
            tag: 'div',
            attr: { class: `${INTERACTION_AREAS_PREFIX}-layout-message-do-not-show` },
            children: [
              {
                tag: 'input',
                attr: { type: 'checkbox', class: `${INTERACTION_AREAS_PREFIX}-layout-message-checkbox`, id },
                event: {
                  name: 'input',
                  callback: (event) => {
                    checked = event.target.checked;
                  }
                }
              },
              {
                tag: 'label',
                attr: { class: `${INTERACTION_AREAS_PREFIX}-layout-message-checkbox-title`, for: id },
                children: 'Don׳t show it again'
              }
            ]
          }
        ]
      }
    ]
  });

  setInteractionAreasContainer(videojs, tracksContainer);
};


export const setInteractionAreasContainerSize = (videojs, videoElement) => {

  const interactionAreasContainer = videojs.el().querySelector(`.${INTERACTION_AREAS_CONTAINER_CLASS_NAME}`);

  if (!interactionAreasContainer) {
    return;
  }

  const { videoHeight, videoWidth } = videoElement;
  const videoAspectRatio = videoWidth / videoHeight;

  const width = videoAspectRatio * videoElement.clientHeight;

  interactionAreasContainer.style.width = `${videoElement.clientWidth < width ? '100%' : width}px`;
  interactionAreasContainer.style.height = videoElement.clientWidth < width ? `${videoElement.clientWidth / videoAspectRatio}px` : '100%';
};
