import videojs from 'video.js';
import './cloudinary-button.scss';

// support VJS5 & VJS6 at the same time
const ClickableComponent = videojs.getComponent('ClickableComponent');

class CloudinaryButton extends ClickableComponent {

  createEl() {
    let display = this.options_.playerOptions.poweredByUrl ? 'block' : 'none';
    return videojs.dom.createEl('a', {
      className: 'vjs-control vjs-cloudinary-button vjs-button',
      href: this.options_.playerOptions.poweredByUrl,
      target: '_blank',
      style: 'display: ' + display + ';background-image: url(' + this.options_.playerOptions.poweredByLogo + ')'
    });
  }
}

videojs.registerComponent('cloudinaryButton', CloudinaryButton);

export default CloudinaryButton;
