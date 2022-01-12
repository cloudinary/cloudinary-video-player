import videojs from 'video.js';
import './videojs-contextmenu';
import './context-menu.scss';
import ContextMenu from './components/context-menu';
import { getPointerPosition } from 'utils/positioning';
import { sliceProperties } from 'utils/slicing';
import { assign } from 'utils/assign';
import { isFunction } from 'utils/type-inference';

const defaults = {
  showNativeOnRecurringEvent: false
};

class ContextMenuPlugin {

  constructor(player, initOpts) {
    if (!Array.isArray(initOpts.content) && !isFunction(initOpts.content)) {
      throw new Error('"content" required');
    }

    const opts = assign({}, defaults, initOpts);

    this.player = player;
    const _options = sliceProperties(opts, 'content', 'showNativeOnRecurringEvent');

    this.init = () => {
      // If we are not already providing "vjs-contextmenu" events, do so.
      this.player.contextmenu();
      this.player.on('vjs-contextmenu', onContextMenu);
      this.player.ready(() => this.player.addClass('vjs-context-menu'));
    };

    const getMenuPosition = (e) => {
      // Calc menu size
      const menuEl = this.menu.el();

      // Must append to element to get bounding rect
      menuEl.style.visibility = 'hidden';
      this.player.el().appendChild(menuEl);
      const menuSize = menuEl.getBoundingClientRect();
      this.player.el().removeChild(menuEl);
      menuEl.style.visibility = 'visible';

      const ptrPosition = getPointerPosition(this.player.el(), e);
      const playerSize = this.player.el().getBoundingClientRect();

      let ptrTop = playerSize.height - (playerSize.height * ptrPosition.y) + 1;
      let ptrLeft = Math.round(playerSize.width * ptrPosition.x) + 1;

      let top = ptrTop;
      let left = ptrLeft;

      // Correct top when menu can't fit fully height-wise when pointer is at it's top left corner
      if (ptrTop + menuSize.height > playerSize.height) {
        let difference = ptrTop + menuSize.height - playerSize.height;
        top = difference > menuSize.height / 2 ? ptrTop - menuSize.height - 1 : playerSize.height - menuSize.height;
      }

      // Correct left where menu can't fit fully width-wise when pointer is at it's top left corner
      if (ptrLeft + menuSize.width > playerSize.width) {
        let difference = ptrLeft + menuSize.width - playerSize.width;
        left = difference > menuSize.width / 2 ? ptrLeft - menuSize.width - 1 : playerSize.width - menuSize.width;
      }

      // Correct top and left in cases that menu is positioned on the pointer
      if (top < ptrTop && left < ptrLeft) {
        top = ptrTop - menuSize.height - 1;
        left = ptrLeft - menuSize.width - 1;
      }

      // Make sure that we're still in bounds after the corrections.
      top = Math.max(0, top);
      left = Math.max(0, left);

      return { left, top };
    };

    const onContextMenu = (e) => {
      if (this.menu) {
        this.menu.dispose();
        if (_options.showNativeOnRecurringEvent) {
        // If this event happens while the custom menu is open, close it and do
        // nothing else. This will cause native contextmenu events to be intercepted
        // once again; so, the next time a contextmenu event is encountered, we'll
        // open the custom menu.
          return;
        }
      }

      // Stop canceling the native contextmenu event until further notice.
      if (_options.showNativeOnRecurringEvent) {
        this.player.contextmenu.options.cancel = false;
      }

      e.preventDefault();

      // Allow dynamically setting the menu labels based on player
      let content = _options.content;

      if (isFunction(content)) {
        content = content(this.player);
      }

      this.menu = new ContextMenu(this.player, { content });

      const { left, top } = getMenuPosition(e);
      this.menu.setPosition(left, top);

      // This is to handle a bug where firefox triggers both 'contextmenu' and 'click'
      // events on rightclick, causing menu to open and then immediately close.
      const clickHandler = (_e) => {
        if (!(_e.type === 'click' && (_e.which === 3 || _e.button === 2))) {
          this.menu.dispose();
        }
      };

      this.menu.on('dispose', () => {
        // Begin canceling contextmenu events again, so subsequent events will
        // cause the custom menu to be displayed again.
        this.player.contextmenu.options.cancel = true;
        this.player.removeChild(this.menu);
        videojs.off(document, ['click', 'tap'], clickHandler);
        delete this.menu;
      });

      this.player.addChild(this.menu);
      videojs.on(document, ['click', 'tap'], clickHandler);
    };
  }
}

export default function(opts = {}) {
  new ContextMenuPlugin(this, opts).init();
}
