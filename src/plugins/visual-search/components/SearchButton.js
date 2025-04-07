import videojs from 'video.js';

export const SearchButton = (onClick) => {
  const button = videojs.dom.createEl('button', {
    className: 'vjs-control vjs-button vjs-visual-search-button',
    title: 'Search video content',
    ariaLabel: 'Search video content'
  });
  
  const searchIcon = videojs.dom.createEl('span', {
    className: 'vjs-icon-search'
  });
  button.appendChild(searchIcon);
  
  const spinnerIcon = videojs.dom.createEl('span', {
    className: 'vjs-loading-spinner'
  });
  button.appendChild(spinnerIcon);
  
  button.addEventListener('click', onClick);
  
  return button;
};
