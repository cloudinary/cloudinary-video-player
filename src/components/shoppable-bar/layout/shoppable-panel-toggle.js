import videojs from 'video.js';
const dom = videojs.dom || videojs;

const ClickableComponent = videojs.getComponent('ClickableComponent');

class ShoppablePanelToggle extends ClickableComponent {
  constructor(player, options) {
    super(player, options);
    this.options_ = options;
  }

  handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.options_.clickHandler();
  }

  createEl() {

    let iconProps = {};
    if (this.options_.toggleIcon) {
      iconProps = {
        className: 'cld-spbl-toggle-icon cld-spbl-toggle-custom-icon vjs-icon-close',
        style: `background-image: url(${this.options_.toggleIcon})`
      };
    } else {
      iconProps = {
        className: 'cld-spbl-toggle-icon vjs-icon-cart'
      };
    }
    const icon = dom.createEl('span', iconProps);

    const el = super.createEl('a', {
      className: 'cld-spbl-toggle base-color-bg'
    });
    el.appendChild(icon);

    this.player_.on('productBarMin', () => {
      setTimeout(() => {
        icon.classList.add('animate');
        setTimeout(() => {
          icon.classList.remove('animate');
        }, 1000);
      }, 500);
    });

    return el;
  }
}

videojs.registerComponent('shoppablePanelToggle', ShoppablePanelToggle);

export default ShoppablePanelToggle;
