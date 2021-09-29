import videojs from 'video.js';
import './logo-button.scss';
import { DARK_BG_ICON, LIGHT_BG_ICON } from './logo-button.const';
import { isLight } from '../../video-player.utils';

// support VJS5 & VJS6 at the same time
const ClickableComponent = videojs.getComponent('ClickableComponent');

class LogoButton extends ClickableComponent {

  createEl() {
    const opts = this.options_.playerOptions;
    const display = opts.showLogo ? 'block' : 'none';

    const _isLight = isLight(opts) ? LIGHT_BG_ICON : DARK_BG_ICON;

    const bgIcon = opts.logoImageUrl ? opts.logoImageUrl : _isLight;

    return videojs.dom.createEl('a', {}, {
      class: 'vjs-control vjs-cloudinary-button vjs-button',
      href: opts.logoOnclickUrl,
      target: '_blank',
      style: `display: ${display}; background-image: url(${bgIcon})`
    });
  }
}

videojs.registerComponent('logoButton', LogoButton);

export default LogoButton;
