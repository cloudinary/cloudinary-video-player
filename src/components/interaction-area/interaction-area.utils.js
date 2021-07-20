import { elementsCreator } from '../../utils/dom';
import {
  INTERACTION_AREA_HAND_ICON,
  INTERACTION_AREA_LAYOUT_LOCAL_STORAGE_NAME,
  INTERACTION_AREAS_CONTAINER_CLASS_NAME,
  INTERACTION_AREAS_PREFIX
} from './interaction-area.const';
import { getDefaultPlayerColor } from '../../plugins/colors';

export const getInteractionAreaItem = (playerOptions, item, onClick) => {
  const defaultColor = getDefaultPlayerColor(playerOptions.cloudinary.chainTarget._videojsOptions);
  const accentColor = playerOptions && playerOptions.colors ? playerOptions.colors.accent : defaultColor.accent;

  return elementsCreator({
    tag: 'div',
    attr: { class: `${INTERACTION_AREAS_PREFIX}-item` },
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
            style: { backgroundColor: accentColor }
          },
          {
            tag: 'div',
            attr: { class: `${INTERACTION_AREAS_PREFIX}-marker-main` },
            style: { borderColor: accentColor }
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
  const currentInteractionAreasContainer = getInteractionAreasContainer(videojs);

  if (currentInteractionAreasContainer) {
    currentInteractionAreasContainer.replaceWith(newInteractionAreasContainer);
  } else {
    videojs.el().append(newInteractionAreasContainer);
  }
};


export const shouldShowAreaLayoutMessage = (interactionLayoutConfig) => {
  return (!interactionLayoutConfig || interactionLayoutConfig.enable) && localStorage.getItem(INTERACTION_AREA_LAYOUT_LOCAL_STORAGE_NAME) !== 'true';
};


const onClickInteractionAreaLayoutClick = (checked, onClick) => {
  localStorage.setItem(INTERACTION_AREA_LAYOUT_LOCAL_STORAGE_NAME, JSON.parse(checked));
  onClick();
};

export const createInteractionAreaLayoutMessage = (videojs, onClick, showItAgainCheckbox = false) => {

  let checked = false;

  const id = `checkbox_${Math.round(Math.random() * 10000)}`;

  const tracksContainer = elementsCreator({
    tag: 'div',
    attr: { class: `${INTERACTION_AREAS_CONTAINER_CLASS_NAME} ${INTERACTION_AREAS_PREFIX}-layout-message ${showItAgainCheckbox ? '' : 'clickable'}` },
    onClick: !showItAgainCheckbox ? () => onClickInteractionAreaLayoutClick(checked, onClick) : null,
    children: [
      {
        tag: 'img',
        attr: { class: `${INTERACTION_AREAS_PREFIX}-layout-icon`, src: INTERACTION_AREA_HAND_ICON }
      },
      {
        tag: 'h3',
        attr: { class: `${INTERACTION_AREAS_PREFIX}-layout-message-title` },
        children: 'Tap on dots to zoom for a product.'
      },
      {
        tag: 'button',
        attr: { class: `${INTERACTION_AREAS_PREFIX}-layout-message-button` },
        children: 'Got it',
        onClick: showItAgainCheckbox ? () => onClickInteractionAreaLayoutClick(checked, onClick) : null
      },
      showItAgainCheckbox && {
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
    ].filter(i => i)
  });

  setInteractionAreasContainer(videojs, tracksContainer);
};

const getInteractionAreasContainer = (videojs) => videojs.el().querySelector(`.${INTERACTION_AREAS_CONTAINER_CLASS_NAME}`);

export const removeInteractionAreasContainer = (videojs) => {
  const interactionAreasContainer = getInteractionAreasContainer(videojs);

  interactionAreasContainer && interactionAreasContainer.remove();
};


export const setInteractionAreasContainerSize = (videojs, videoElement) => {

  const interactionAreasContainer = getInteractionAreasContainer(videojs);

  if (!interactionAreasContainer) {
    return;
  }

  const { videoHeight, videoWidth } = videoElement;
  const videoAspectRatio = videoWidth / videoHeight;

  const width = videoAspectRatio * videoElement.clientHeight;

  interactionAreasContainer.style.width = `${videoElement.clientWidth < width ? '100%' : width}px`;
  interactionAreasContainer.style.height = videoElement.clientWidth < width ? `${videoElement.clientWidth / videoAspectRatio}px` : '100%';
};
