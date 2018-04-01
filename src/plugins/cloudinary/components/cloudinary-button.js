import videojs from 'video.js';
import './cloudinary-button.scss';

// support VJS5 & VJS6 at the same time
const dom = videojs.dom || videojs;
const Component = videojs.getComponent('Component');
const ClickableComponent = videojs.getComponent('ClickableComponent');

class CloudinaryButton extends ClickableComponent {
  constructor(player, options) {
    super(player, options);

    const clickOutsideHandler = (e) => {
      const isClickInside = player.el().querySelector('.vjs-cloudinary-tooltip').contains(e.target);
      const toggleButtonClicked = player.el().querySelector('.vjs-cloudinary-button') === e.target;
      if (!isClickInside && !toggleButtonClicked) {
        player.removeClass('vjs-cloudinary-tooltip-show');
      }
    };
    window.addEventListener('click', clickOutsideHandler);

    player.addChild('cloudinaryTooltip');
  }

  toggleTooltip() {
    let tool = this.player().getChild('CloudinaryTooltip');
    this.player().trigger('info');

    this.player().toggleClass('vjs-cloudinary-tooltip-show');
  }

  handleClick(event) {
    super.handleClick(event);
    this.toggleTooltip();
  }

  // The `createEl` function of a component creates its DOM element.
  createEl() {
    return videojs.createEl('button', {
      className: 'vjs-control vjs-cloudinary-button vjs-button'
    });
  }
}

class CloudinaryTooltip extends Component {
  constructor(player, options) {
    super(player, options);
    this.player_ = player;
  }


  createEl() {
    const tooltip = super.createEl('div', {
      className: 'vjs-cloudinary-tooltip'
    });

    const logo = dom.createEl('div', {
      className: 'vjs-cloudinary-tooltip-header',
      innerHTML: 'Powered By <span class="logo"></span>'
    });
    tooltip.appendChild(logo);

    const field = dom.createEl('div', {
      className: 'vjs-cloudinary-tooltip-data-field',
      innerHTML: '<span class="label">Video ID</span><span class="value">asFgS74o8631fh5</span>'
    });
    tooltip.appendChild(field);
    const addInfo = () => {
      let w = this.player().videoWidth();
      let h = this.player().videoHeight();
      let info = {
        volume: this.player().volume(),
        dimensions: w + ' X ' + h,
        videoId: this.player().cloudinary.currentPublicId(),
        buffered: this.player().bufferedPercent()
      };
      console.log(JSON.stringify(info));
    };


    this.player().on('info', addInfo);
    return tooltip;
  }
}


class CloudinaryTooltipCloseButton extends ClickableComponent {
  handleClick(event) {
    super.handleClick(event);
    this.player().removeClass('vjs-cloudinary-tooltip-show');
  }

  createEl() {
    return videojs.createEl('button', {
      className: 'vjs-control vjs-cloudinary-tooltip-close-button'
    });
  }
}

videojs.registerComponent('cloudinaryTooltipCloseButton', CloudinaryTooltipCloseButton);
videojs.registerComponent('cloudinaryButton', CloudinaryButton);
videojs.registerComponent('cloudinaryTooltip', CloudinaryTooltip);
CloudinaryTooltip.prototype.options_ = {children: ['CloudinaryTooltipCloseButton']};

export default CloudinaryButton;
