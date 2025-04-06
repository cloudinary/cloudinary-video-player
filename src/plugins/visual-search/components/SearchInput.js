import videojs from 'video.js';

export const SearchInput = (onSearch, onClose) => {
  const form = videojs.dom.createEl('form', {
    className: 'vjs-visual-search-form'
  });
  
  const input = videojs.dom.createEl('input', {
    className: 'vjs-visual-search-input',
    type: 'text',
    ariaLabel: 'Search input',
    tabIndex: -1
  });
  
  const closeButton = videojs.dom.createEl('button', {
    className: 'vjs-control vjs-button vjs-visual-search-close',
    type: 'button',
    title: 'Close search',
    ariaLabel: 'Close search',
    tabIndex: -1
  });
  
  // Add close icon
  const closeIcon = videojs.dom.createEl('span', {
    className: 'vjs-icon-close'
  });
  closeButton.appendChild(closeIcon);
  
  form.appendChild(input);
  form.appendChild(closeButton);
  
  // Handle search submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) {
      onSearch(query);
    }
  });
  
  // Handle close button
  closeButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (onClose) {
      onClose();
    }
  });
  
  return {
    element: form,
    input,
    closeButton
  };
};
