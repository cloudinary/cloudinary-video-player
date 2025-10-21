import videojs from 'video.js';
import './big-pause-button.scss';

const BigPlayButton = videojs.getComponent('BigPlayButton');

class BigPauseButton extends BigPlayButton {
  constructor(player, options) {
    super(player, options);
    this.boundUpdate = this.handleUpdate.bind(this);
    const playerInstance = this.player();
    playerInstance.on('play', this.boundUpdate);
    playerInstance.on('pause', this.boundUpdate);
    this.handleUpdate();
  }

  buildCSSClass() {
    return `${super.buildCSSClass()} vjs-big-pause-button`;
  }

  handleClick() {
    const player = this.player();
    !player.paused() && player.pause();
  }

  handleUpdate() {
    const player = this.player();
    if (!player) {
      return;
    }
    const paused = player.paused();
    (!paused && player.hasStarted()) ? this.show() : this.hide();
    this[paused ? 'removeClass' : 'addClass']('vjs-playing');
    this.controlText('Pause');
  }

  dispose() {
    if (this.boundUpdate) {
      const player = this.player();
      player.off('play', this.boundUpdate);
      player.off('pause', this.boundUpdate);
    }
    super.dispose();
  }
}

videojs.registerComponent('BigPauseButton', BigPauseButton);

export default BigPauseButton;