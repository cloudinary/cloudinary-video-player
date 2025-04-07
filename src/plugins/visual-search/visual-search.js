import videojs from 'video.js';
import { SearchButton } from './components/SearchButton';
import { SearchInput } from './components/SearchInput';
import { SearchResults } from './components/SearchResults';

import './visual-search.scss';

const visualSearch = (options, player) => {
  player.addClass('vjs-visual-search');

  let isSearchActive = false;

  const searchResults = SearchResults(player);

  const performSearch = async query => {
    const searchButton = player.$('.vjs-visual-search-button');
    searchButton.classList.add('vjs-waiting');

    try {
      const source = player.cloudinary.source();
      const publicId = source.publicId();
      const transformation = Object.assign({}, source.transformation());

      transformation.flags = transformation.flags || [];
      transformation.flags.push(`getinfo:search_b64_${btoa(query)}`);

      const visualSearchSrc = source.config().url(`${publicId}`, { transformation });

      const response = await fetch(visualSearchSrc, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Search request failed with status: ${response.status}`);
      }

      const results = await response.json();
      searchResults.displayResults(results.timestamps);

      if (results && !player.hasStarted()) {
        // Make sure the progress bar is visible
        player.play().then(() => player.pause());
      }
    } catch (error) {
      console.error('Error performing visual search:', error);
    } finally {
      searchButton.classList.remove('vjs-waiting');
    }
  };

  const clearUI = () => {
    isSearchActive = false;
    searchResults.clearMarkers();
    player.$('.vjs-visual-search-wrapper')?.remove();
  };

  const createSearchUI = () => {
    clearUI();

    const titleBar = player.$('.vjs-title-bar');
    if (titleBar) {
      titleBar.classList.remove('vjs-hidden');
    }

    const searchContainer = videojs.dom.createEl('div', {
      className: 'vjs-visual-search-wrapper'
    });

    // Handle the search icon click (expand or submit)
    const handleSearchButtonClick = () => {
      if (!isSearchActive) {
        isSearchActive = true;
        searchContainer.classList.add('vjs-visual-search-active');
        searchInput.input.tabIndex = 0;
        searchInput.closeButton.tabIndex = 0;
        searchInput.input.focus();
      } else {
        const query = searchInput.input.value.trim();
        if (query) {
          performSearch(query);
        }
      }
    };

    const closeSearch = () => {
      if (isSearchActive) {
        isSearchActive = false;
        searchContainer.classList.remove('vjs-visual-search-active');
        searchInput.input.value = '';
        searchInput.input.tabIndex = -1;
        searchInput.closeButton.tabIndex = -1;

        searchResults.clearMarkers();
      }
    };

    const searchButton = SearchButton(handleSearchButtonClick);
    const searchInput = SearchInput(performSearch, closeSearch);
    searchContainer.appendChild(searchButton);
    searchContainer.appendChild(searchInput.element);

    titleBar.prepend(searchContainer);

    player.on('keydown', e => {
      if (e.key === 'Escape' && isSearchActive) {
        closeSearch();
      }
    });
  };

  createSearchUI();

  // Public methods
  player.visualSearch = {
    createSearchUI,
    clearUI
  };
};

export default visualSearch;
