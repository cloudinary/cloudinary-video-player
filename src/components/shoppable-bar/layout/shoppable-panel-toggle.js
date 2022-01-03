import videojs from 'video.js';
import {
  CLD_SPBL_TOGGLE_CLASS,
  CLD_SPBL_TOGGLE_CUSTOM_ICON_CLASS,
  CLD_SPBL_TOGGLE_ICON_CLASS,
  CLOSE_ICON_CLASS,
  ICON_CART_CLASS,
  SHOPPABLE_ANIMATION_CLASS
} from '../shoppable-widget.const';
import { PLAYER_EVENT } from '../../../utils/consts';
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
    let iconAttrs = {};
    if (this.options_.toggleIcon) {
      iconProps = {
        className: `${CLD_SPBL_TOGGLE_ICON_CLASS} ${CLD_SPBL_TOGGLE_CUSTOM_ICON_CLASS} ${CLOSE_ICON_CLASS}`
      };
      iconAttrs = {
        style: `background-image: url(${this.options_.toggleIcon})`
      };
    } else {
      iconProps = {
        className: `${CLD_SPBL_TOGGLE_ICON_CLASS} ${ICON_CART_CLASS}`
      };
    }
    const icon = dom.createEl('span', iconProps, iconAttrs);

    const el = super.createEl('a', {
      className: `${CLD_SPBL_TOGGLE_CLASS} base-color-bg`
    });
    el.appendChild(icon);

    this.player_.on(PLAYER_EVENT.PRODUCT_BAR_MIN, () => {
      setTimeout(() => {
        icon.classList.add(SHOPPABLE_ANIMATION_CLASS);
        setTimeout(() => {
          icon.classList.remove(SHOPPABLE_ANIMATION_CLASS);
        }, 1000);
      }, 500);
    });

    return el;
  }
}

videojs.registerComponent('shoppablePanelToggle', ShoppablePanelToggle);

export default ShoppablePanelToggle;
