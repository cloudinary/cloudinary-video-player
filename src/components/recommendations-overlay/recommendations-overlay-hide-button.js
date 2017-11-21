import videojs from 'video.js';

const ClickableComponent = videojs.getComponent('ClickableComponent');

class RecommendationOverlayHideButton extends ClickableComponent {
  createEl() {
    const el = super.createEl('span', {
      className: 'vjs-recommendations-overlay-hide vjs-icon-close'
    });

    return el;
  }

  handleClick() {
    this.options_.clickHandler();
  }
}

export default RecommendationOverlayHideButton;
