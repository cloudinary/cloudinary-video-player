import videojs from 'video.js';

export const SearchResults = (player) => {
  const clearMarkers = () => {
    player.$$('.vjs-visual-search-marker').forEach(el => el.remove());
    
    // Remove the class that indicates search results are displayed
    player.removeClass('vjs-visual-search-results-active');
  };
  
  const displayResults = (results) => {
    // Clear existing markers
    clearMarkers();
    
    const total = player.duration();
    const seekBar = player.controlBar.progressControl.seekBar;
    
    // Add markers for each result
    results.forEach(result => {
      const { start_time, end_time } = result;
      const markerEl = videojs.dom.createEl('div', {
        className: 'vjs-visual-search-marker',
        style: `left: ${(start_time / total) * 100}%; width: ${((end_time - start_time) / total) * 100}%`
      });
      
      seekBar.el().appendChild(markerEl);
      
      // Add click handler to jump to this time
      markerEl.addEventListener('click', () => {
        player.currentTime(start_time);
      });
    });
    
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
