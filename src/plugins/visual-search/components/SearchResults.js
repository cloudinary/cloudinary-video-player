import videojs from 'video.js';

export const SearchResults = player => {
  const clearMarkers = () => {
    player.$$('.vjs-visual-search-marker').forEach(el => el.remove());
    player.$$('.vjs-visual-search-results-wrapper').forEach(el => el.remove());

    // Remove the class that indicates search results are displayed
    player.removeClass('vjs-visual-search-results-active');
  };

  const displayResults = results => {
    // Clear existing markers
    clearMarkers();

    const total = player.duration();
    const seekBar = player.controlBar.progressControl.seekBar;

    // Create wrapper for search results
    const wrapperEl = videojs.dom.createEl('div', {
      className: 'vjs-visual-search-results-wrapper',
      role: 'presentation'
    });

    // Add markers for each result
    results.forEach(result => {
      const { start_time, end_time } = result;
      const position = (start_time / total) * 100;
      const width = ((end_time - start_time) / total) * 100;
      const time = `${Math.floor(start_time / 60)}:${Math.floor(start_time % 60)
        .toString()
        .padStart(2, '0')}`;

      const markerEl = videojs.dom.createEl('div', {
        className: 'vjs-control vjs-visual-search-marker',
        style: `left: ${position}%; width: ${width}%`,
        tabIndex: 0,
        role: 'button',
        title: `Search result at ${time}`,
        ariaLabel: `Search result at ${time}`
      });

      wrapperEl.appendChild(markerEl);

      // Add click handler to jump to this time
      markerEl.addEventListener('click', () => {
        player.currentTime(start_time);
      });

      // Add keyboard support
      markerEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          player.currentTime(start_time);
        }
      });
    });

    // Add wrapper to seek bar
    seekBar.el().appendChild(wrapperEl);

    // Add a class to indicate search results are displayed
    if (results.length > 0) {
      player.addClass('vjs-visual-search-results-active');
    }
  };

  return {
    displayResults,
    clearMarkers
  };
};
