import videojs from 'video.js';

export const SearchButton = (onClick) => {
  const button = videojs.dom.createEl('button', {
    className: 'vjs-visual-search-button',
    title: 'Search video content'
  });
  
  // Add search icon
  const iconElement = videojs.dom.createEl('span', {
    className: 'vjs-icon-search'
  });
  button.appendChild(iconElement);
  
  button.addEventListener('click', onClick);
  
  return button;
};
