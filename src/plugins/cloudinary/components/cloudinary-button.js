import videojs from 'video.js';
import './cloudinary-button.scss';

const LIGHT_BG_ICON = 'https://cloudinary-res.cloudinary.com/image/upload/fl_attachment/v1/logo/for_white_bg/cloudinary_icon_for_white_bg.svg';
const DARK_BG_ICON = 'https://cloudinary-res.cloudinary.com/image/upload/fl_attachment/v1/logo/for_black_bg/cloudinary_icon_for_black_bg.svg';

// support VJS5 & VJS6 at the same time
const ClickableComponent = videojs.getComponent('ClickableComponent');

class CloudinaryButton extends ClickableComponent {

  createEl() {
    const opts = this.options_.playerOptions;
    const display = opts.showLogo ? 'block' : 'none';
    let bgIcon = '';
    if (opts.logoImageUrl) {
      bgIcon = opts.logoImageUrl;
    } else {
      const isLight = opts.class.indexOf('cld-video-player-skin-light') > -1 || opts.skin === 'light';
      bgIcon = isLight ? LIGHT_BG_ICON : DARK_BG_ICON;
    }
    return videojs.dom.createEl('a', {}, {
      class: 'vjs-control vjs-cloudinary-button vjs-button',
      href: opts.logoOnclickUrl,
      target: '_blank',
      style: `display: ${display}; background-image: url(${bgIcon})`
    });
  }
}

videojs.registerComponent('cloudinaryButton', CloudinaryButton);

export default CloudinaryButton;
