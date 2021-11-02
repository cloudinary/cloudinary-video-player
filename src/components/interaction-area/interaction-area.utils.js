import { elementsCreator, styleElement } from '../../utils/dom';
import { get } from '../../utils/object';
import {
  CLOSE_INTERACTION_AREA_LAYOUT_DELAY,
  INTERACTION_AREA_HAND_ICON,
  INTERACTION_AREA_LAYOUT_LOCAL_STORAGE_NAME,
  INTERACTION_AREAS_CONTAINER_CLASS_NAME,
  INTERACTION_AREAS_PREFIX,
  INTERACTION_AREAS_THEME
} from './interaction-area.const';
import { noop } from '../../utils/type-inference';
import { getDefaultPlayerColor } from '../../plugins/colors';
import { forEach, some } from '../../utils/array';
import { themedButton } from '../themeButton/themedButton';
import { BUTTON_THEME } from '../themeButton/themedButton.const';


const getInteractionAreaItemId = (item, index) => item.id || item.type || `id_${index}`;

export const getInteractionAreaItem = ({ playerOptions, videojsOptions }, item, index, durationTime, onClick) => {
  const defaultColor = getDefaultPlayerColor(videojsOptions);
  const accentColor = playerOptions && playerOptions.colors ? playerOptions.colors.accent : defaultColor.accent;

  // theme = 'pulsing' / 'shadowed'
  const theme = get(videojsOptions, 'interactionDisplay.theme.template', INTERACTION_AREAS_THEME.PULSING);

  return elementsCreator({
    tag: 'div',
    attr: { class: `${INTERACTION_AREAS_PREFIX}-item theme-${theme}`, 'data-id': getInteractionAreaItemId(item, index) },
    style: {
      left: `${item.left}%`,
      top: `${item.top}%`,
      width: `${item.width}%`,
      height: `${item.height}%`,
      transitionDuration: `${durationTime}ms`
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
            style: { [theme === INTERACTION_AREAS_THEME.SHADOWED ? 'backgroundColor' : 'borderColor']: accentColor }
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
    // do not use element.append for ie11 support
    videojs.el().appendChild(newInteractionAreasContainer);
  }
};

const getInteractionAreaElementById = (interactionAreasContainer, item, index) => interactionAreasContainer.querySelector(`[data-id=${getInteractionAreaItemId(item, index)}]`);


export const updateInteractionAreasItem = (videojs, configs, interactionAreasData, previousInteractionAreasData, durationTime, onClick) => {
  const interactionAreasContainer = getInteractionAreasContainer(videojs);

  forEach(interactionAreasData, (item, index) => {
    const itemElement = getInteractionAreaElementById(interactionAreasContainer, item, index);
    const itemId = getInteractionAreaItemId(item);
    const isExistItem = some(previousInteractionAreasData, i => getInteractionAreaItemId(i) === itemId);

    // in case the element of the item is in the dom and exist in the previous data , it update the element position
    if (isExistItem && itemElement) {
      styleElement(itemElement, {
        left: `${item.left}%`,
        top: `${item.top}%`,
        width: `${item.width}%`,
        height: `${item.height}%`,
        transitionDuration: `${durationTime}ms`
      });
      // if the element did not exist before , not in the dom and not in the previous data , it add a new element
    } else if (!isExistItem && !itemElement) {
      // do not use element.append for ie11 support
      interactionAreasContainer.appendChild(getInteractionAreaItem(configs, item, index, durationTime, (event) => {
        onClick({ event, item, index });
      }));
    }
  });

  // checking the previous data for element that should be removed if not exist in the new data object.
  forEach(previousInteractionAreasData, (item, index) => {
    const itemElement = getInteractionAreaElementById(interactionAreasContainer, item, index);
    const itemId = getInteractionAreaItemId(item);
    const shouldBeRemoved = !some(interactionAreasData, i => getInteractionAreaItemId(i) === itemId);

    if (itemElement && shouldBeRemoved) {
      // do not use element.remove for ie11 support
      itemElement.parentNode.removeChild(itemElement);
    }
  });

};

export const shouldShowAreaLayoutMessage = (interactionAreasConfig) => {
  const isLayoutEnabled = get(interactionAreasConfig, 'layout.enable', true);

  return isLayoutEnabled && localStorage.getItem(INTERACTION_AREA_LAYOUT_LOCAL_STORAGE_NAME) !== 'true';
};


const onClickInteractionAreaLayoutClick = (checked, onClick = noop) => {
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
      themedButton({
        text: 'Got it',
        theme: BUTTON_THEME.TRANSPARENT_WHITE,
        loadingDelay: showItAgainCheckbox ? 0 : CLOSE_INTERACTION_AREA_LAYOUT_DELAY,
        onClick: showItAgainCheckbox ? () => onClickInteractionAreaLayoutClick(checked, onClick) : null
      }),
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

  // do not use element.remove for ie11 support
  interactionAreasContainer && interactionAreasContainer.parentNode.removeChild(interactionAreasContainer);
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
