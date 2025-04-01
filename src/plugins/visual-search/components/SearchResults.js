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
      const { startTime, endTime } = result;
      const markerEl = videojs.dom.createEl('div', {
        className: 'vjs-visual-search-marker',
        style: `left: ${(startTime / total) * 100}%; width: ${((endTime - startTime) / total) * 100}%`
      });
      
      seekBar.el().appendChild(markerEl);
      
      // Add click handler to jump to this time
      markerEl.addEventListener('click', () => {
        player.currentTime(startTime);
        player.play();
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
