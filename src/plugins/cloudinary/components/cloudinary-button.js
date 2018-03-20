import videojs from 'video.js';
import './cloudinary-tooltip.scss';

// support VJS5 & VJS6 at the same time
const dom = videojs.dom || videojs;

const Component = videojs.getComponent('Component');
const ClickableComponent = videojs.getComponent('ClickableComponent');

// Create a common class for playlist buttons
class CloudinaryButton extends ClickableComponent {
  constructor(player, options) {
    // It is important to invoke the superclass before anything else,
    // to get all the features of components out of the box!
    super(player, options);

    player.addChild('cloudinaryTooltip');
  }

  toggleTooltip() {
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
CloudinaryTooltip.prototype.options_ = { children: ['CloudinaryTooltipCloseButton'] };

export default CloudinaryButton;
