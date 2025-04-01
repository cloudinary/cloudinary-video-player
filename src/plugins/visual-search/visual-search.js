import videojs from 'video.js';
import './visual-search.scss';
import { SearchButton } from './components/SearchButton';
import { SearchInput } from './components/SearchInput';
import { SearchResults } from './components/SearchResults';
import { generateMockResults } from './utils/mockData';

const visualSearch = (options, player) => {
  player.addClass('vjs-visual-search');

  let isSearchActive = false;

  const searchResults = SearchResults(player);

  const performSearch = async query => {
    try {
      let results;

      if (options.useMockData) {
        results = generateMockResults(query, player.duration(), options.mockResultCount || 5);
        searchResults.displayResults(results);
      } else {

        // ToDo: construct these search URLs using getCloudinaryUrl
        // https://res.cloudinary.com/demo/video/upload/fl_getinfo:search_text_woman/marketing-video-2025
        // Or fl_getingo:search_b64_<base_64_query>

        const url = 'search endpoint';

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Search request failed with status: ${response.status}`);
        }

        results = await response.json();
        searchResults.displayResults(results);

      }

      if (results && !player.hasStarted()) {
        // Make sure the progress bar is visible
        player.play().then(() => player.pause());
      }
    } catch (error) {
      console.error('Error performing visual search:', error);
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
