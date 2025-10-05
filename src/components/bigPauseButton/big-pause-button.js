import videojs from 'video.js';
import './big-pause-button.scss';

const BigPlayButton = videojs.getComponent('BigPlayButton');

class BigPauseButton extends BigPlayButton {
  constructor(player, options) {
    super(player, options);
    this.controlText('Pause');
    
    this.boundHandler = this.handlePlayPause.bind(this);
    this.player().on('play', this.boundHandler);
    this.player().on('pause', this.boundHandler);
    this.handlePlayPause();
  }

  buildCSSClass() {
    return `${super.buildCSSClass()} vjs-big-pause-button`;
  }

  handleClick() {
    if (!this.player().paused()) this.player().pause();
  }

  handlePlayPause() {
    (!this.player().paused() && this.player().hasStarted()) ? this.show() : this.hide();
  }

  dispose() {
    if (this.boundHandler) {
      this.player().off('play', this.boundHandler);
      this.player().off('pause', this.boundHandler);
    }
    super.dispose();
  }
}

videojs.registerComponent('BigPauseButton', BigPauseButton);

export default BigPauseButton;