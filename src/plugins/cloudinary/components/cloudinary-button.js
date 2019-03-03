import videojs from 'video.js';
import './cloudinary-button.scss';

// support VJS5 & VJS6 at the same time
const ClickableComponent = videojs.getComponent('ClickableComponent');

class CloudinaryButton extends ClickableComponent {

  createEl() {
    const display = this.options_.playerOptions.showLogo ? 'block' : 'none';
    return videojs.dom.createEl('a', {
      className: 'vjs-control vjs-cloudinary-button vjs-button',
      href: this.options_.playerOptions.logoOnclickUrl,
      target: '_blank',
      style: `display: ${display} ;background-image: url(${this.options_.playerOptions.logoImageUrl})`
    });
  }
}

videojs.registerComponent('cloudinaryButton', CloudinaryButton);

export default CloudinaryButton;
