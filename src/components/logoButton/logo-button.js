import videojs from 'video.js';
import './logo-button.scss';

// support VJS5 & VJS6 at the same time
const ClickableComponent = videojs.getComponent('ClickableComponent');

class LogoButton extends ClickableComponent {

  createEl() {
    const opts = this.options_.playerOptions;
    const display = opts.showLogo ? 'block' : 'none';

    const bgImage = opts.logoImageUrl ? `background-image: url(${opts.logoImageUrl})` : '';

    return videojs.dom.createEl('a', {}, {
      class: 'vjs-control vjs-cloudinary-button vjs-button',
      href: opts.logoOnclickUrl,
      target: '_blank',
      style: `display: ${display}; ${bgImage}`,
      'aria-label': 'Logo link'
    });
  }
}

videojs.registerComponent('logoButton', LogoButton);

export default LogoButton;
