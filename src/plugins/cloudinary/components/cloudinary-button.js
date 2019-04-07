import videojs from 'video.js';
import './cloudinary-button.scss';

const LIGHT_BG_ICON = 'https://cloudinary-res.cloudinary.com/image/upload/fl_attachment/v1/logo/for_white_bg/cloudinary_icon_for_white_bg.svg';
const DARK_BG_ICON = 'https://cloudinary-res.cloudinary.com/image/upload/fl_attachment/v1/logo/for_black_bg/cloudinary_icon_for_black_bg.svg';

// support VJS5 & VJS6 at the same time
const ClickableComponent = videojs.getComponent('ClickableComponent');

class CloudinaryButton extends ClickableComponent {

  createEl() {
    const display = this.options_.playerOptions.showLogo ? 'block' : 'none';
    let bgIcon = '';
    if (!this.options_.playerOptions.logoImageUrl) {
      let classes = this.options_.playerOptions.class.split(' ');
      bgIcon = (classes.indexOf('cld-video-player-skin-light') > -1) ? LIGHT_BG_ICON : DARK_BG_ICON;
    } else {
      bgIcon = this.options_.playerOptions.logoImageUrl;
    }
    return videojs.dom.createEl('a', {
      className: 'vjs-control vjs-cloudinary-button vjs-button',
      href: this.options_.playerOptions.logoOnclickUrl,
      target: '_blank',
      style: `display: ${display} ;background-image: url(${bgIcon})`
    });
  }
}

videojs.registerComponent('cloudinaryButton', CloudinaryButton);

export default CloudinaryButton;
