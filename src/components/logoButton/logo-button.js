import videojs from 'video.js';
import './logo-button.scss';

const LIGHT_BG_ICON = 'https://res.cloudinary.com/cloudinary-marketing/image/upload/v1597164189/creative_source/Logo/Cloud%20Glyph/cloudinary_cloud_glyph_regular.svg';
const DARK_BG_ICON = 'https://res.cloudinary.com/cloudinary-marketing/image/upload/v1597164191/creative_source/Logo/Cloud%20Glyph/cloudinary_cloud_glyph_white.svg';

// support VJS5 & VJS6 at the same time
const ClickableComponent = videojs.getComponent('ClickableComponent');

class LogoButton extends ClickableComponent {

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

videojs.registerComponent('logoButton', LogoButton);

export default LogoButton;
