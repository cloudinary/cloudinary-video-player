import videojs from 'video.js';

const ClickableComponent = videojs.getComponent('ClickableComponent');

class JumpBackButton extends ClickableComponent {

  handleClick(event) {
    super.handleClick(event);
    this.player().currentTime(this.player().currentTime() - 10);
  }

  createEl() {
    return videojs.dom.createEl('button', {
      className: 'vjs-control vjs-icon-skip-10-min vjs-button'
    });
  }
}

videojs.registerComponent('JumpBackButton', JumpBackButton);

export default JumpBackButton;
