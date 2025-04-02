import videojs from 'video.js';

export const SearchButton = (onClick) => {
  const button = videojs.dom.createEl('button', {
    className: 'vjs-visual-search-button',
    title: 'Search video content'
  });
  
  const searchIcon = videojs.dom.createEl('span', {
    className: 'vjs-icon-search'
  });
  button.appendChild(searchIcon);
  
  const spinnerIcon = videojs.dom.createEl('span', {
    className: 'vjs-icon-spinner vjs-visual-search-spinner'
  });
  button.appendChild(spinnerIcon);
  
  button.addEventListener('click', onClick);
  
  return button;
};
