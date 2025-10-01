import videojs from 'video.js';
import './big-pause-button.scss';

// Extend from BigPlayButton to inherit all its styles and behavior
const BigPlayButton = videojs.getComponent('BigPlayButton');

class BigPauseButton extends BigPlayButton {
  constructor(player, options) {
    super(player, options);
    this.controlText('Pause');
    
    // Only show on mobile devices (use VideoJS's built-in detection)
    this.isMobile = videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
    
    if (!this.isMobile) {
      this.hide();
      return;
    }

    // Listen to player events
    this.player().on('play', this.handlePlayPause.bind(this));
    this.player().on('pause', this.handlePlayPause.bind(this));
    
    // Set initial state
    this.handlePlayPause();
  }

  buildCSSClass() {
    // Keep vjs-big-play-button class for styling, add our custom class
    return `${super.buildCSSClass()} vjs-big-pause-button`;
  }

  handleClick() {
    if (!this.player().paused()) {
      this.player().pause();
    }
  }

  handlePlayPause() {
    if (!this.isMobile) return;
    
    if (!this.player().paused() && this.player().hasStarted()) {
      this.show();
    } else {
      this.hide();
    }
  }

  dispose() {
    // Clean up event listeners
    this.player().off('play', this.handlePlayPause);
    this.player().off('pause', this.handlePlayPause);
    super.dispose();
  }
}

videojs.registerComponent('BigPauseButton', BigPauseButton);

export default BigPauseButton;
