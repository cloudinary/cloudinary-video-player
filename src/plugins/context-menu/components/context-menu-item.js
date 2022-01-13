import videojs from 'video.js';
import { createElement } from 'utils/dom';

const MenuItem = videojs.getComponent('MenuItem');

class ContextMenuItem extends MenuItem {
  handleClick() {
    super.handleClick();
    this.options_.listener();
  }

  createEl() {
    const label = createElement('span', {
      class: 'vjs-menu-item-text' + (this.options_.class ? ` ${this.options_.class}` : '')
    });
    label.appendChild(document.createTextNode(this.localize(this.options_.label)));

    const el = createElement('li', {
      class: 'vjs-menu-item',
      tabIndex: -1
    }, label);

    return el;
  }
}

export default ContextMenuItem;
