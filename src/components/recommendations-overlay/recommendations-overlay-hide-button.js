import videojs from 'video.js';

const ClickableComponent = videojs.getComponent('ClickableComponent');

class RecommendationOverlayHideButton extends ClickableComponent {

  createEl() {
    return super.createEl('span', {
      className: 'vjs-recommendations-overlay-hide vjs-icon-close'
    });
  }

  handleClick() {
    this.options_.clickHandler();
  }
}

export default RecommendationOverlayHideButton;
