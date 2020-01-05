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
    const el = super.createEl('a', {
      className: 'cld-spbl-toggle',
      href: '#'
    });

    return el;
  }
}

videojs.registerComponent('shoppablePanelToggle', ShoppablePanelToggle);

export default ShoppablePanelToggle;
