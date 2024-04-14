import videojs from 'video.js';
import isFunction from 'lodash/isFunction';
import ContextMenuItem from './context-menu-item';
import { setPosition } from 'utils/positioning';

const Menu = videojs.getComponent('Menu');

class ContextMenu extends Menu {

  constructor(player, options) {
    super(player, options);

    options.content.forEach(c => {
      let fn = null;

      if (isFunction(c.listener)) {
        fn = c.listener;
      } else if (typeof c.href === 'string') {
        fn = () => window.open(c.href);
      } else {
        fn = () => true;
      }

      this.addItem(new ContextMenuItem(player, {
        label: c.label,
        class: c.class,
        listener: (...args) => {
          fn(...args);
          this.dispose();
        }
      }));
    });
  }

  setPosition(left, top) {
    setPosition(this.el(), left, top);
  }

  createEl() {
    const el = super.createEl();

    videojs.dom.addClass(el, 'vjs-context-menu-ui');

    if (this.options_.position) {
      const { left, top } = this.options_.position;
      this.setPosition(left, top);
    }

    return el;
  }
}

export default ContextMenu;
