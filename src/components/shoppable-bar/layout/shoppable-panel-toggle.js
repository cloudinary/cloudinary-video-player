import videojs from 'video.js';

const ClickableComponent = videojs.getComponent('ClickableComponent');

class ShoppablePanelToggle extends ClickableComponent {
  constructor(player, options) {
    super(player, options);
    this.options_ = options;
  }

  handleClick(event) {
    super.handleClick(event);
  }

  createEl() {
    let toggleProps = {};
    if (this.options_.toggleIcon) {
      toggleProps = {
        className: 'cld-spbl-toggle cld-spbl-toggle-custom-icon vjs-icon-close base-color-bg',
        style: `background-image: url(${this.options_.toggleIcon})`
      };
    } else {
      toggleProps = {
        className: 'cld-spbl-toggle vjs-icon-cart base-color-bg'
      };
    }

    const el = super.createEl('a', toggleProps);

    return el;
  }
}

videojs.registerComponent('shoppablePanelToggle', ShoppablePanelToggle);

export default ShoppablePanelToggle;
