import { createElement } from './utils/dom';

export const TRACKERS_CONTAINER_CLASS_NAME = 'trackers-container';

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
