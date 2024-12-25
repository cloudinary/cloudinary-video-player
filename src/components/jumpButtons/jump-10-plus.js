import videojs from 'utils/videojs';

const ClickableComponent = videojs.getComponent('ClickableComponent');

class JumpForwardButton extends ClickableComponent {
  handleClick(event) {
    super.handleClick(event);
    this.player().currentTime(this.player().currentTime() + 10);
  }

  createEl() {
    return videojs.dom.createEl('button', {
      className: 'vjs-control vjs-icon-skip-10-plus vjs-icon-forward-10 vjs-button',
      ariaLabel: 'Jump forward 10 seconds'
    });
  }
}

videojs.registerComponent('JumpForwardButton', JumpForwardButton);

export default JumpForwardButton;
