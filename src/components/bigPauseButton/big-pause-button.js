import videojs from 'video.js';
import './big-pause-button.scss';

const BigPlayButton = videojs.getComponent('BigPlayButton');

class BigPauseButton extends BigPlayButton {
  constructor(player, options) {
    super(player, options);
    this.boundUpdate = this.handleUpdate.bind(this);
    const p = this.player();
    p.on('play', this.boundUpdate);
    p.on('pause', this.boundUpdate);
    this.handleUpdate();
  }

  buildCSSClass() {
    return `${super.buildCSSClass()} vjs-big-pause-button`;
  }

  handleClick() {
    const p = this.player();
    p.paused() ? p.play() : p.pause();
  }

  handleUpdate() {
    const p = this.player();
    const paused = p.paused();
    (!paused && p.hasStarted()) ? this.show() : this.hide();
    this[paused ? 'removeClass' : 'addClass']('vjs-playing');
    this.controlText(paused ? 'Play' : 'Pause');
  }

  dispose() {
    if (this.boundUpdate) {
      const p = this.player();
      p.off('play', this.boundUpdate);
      p.off('pause', this.boundUpdate);
    }
    super.dispose();
  }
}

videojs.registerComponent('BigPauseButton', BigPauseButton);

export default BigPauseButton;