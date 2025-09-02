import videojs from 'video.js';
import './source-switcher-button.scss';

const MenuButton = videojs.getComponent('MenuButton');
const MenuItem = videojs.getComponent('MenuItem');

class SourceSwitcherButton extends MenuButton {
  constructor(player, options = {}) {
    super(player, options);

    this.controlText(options.tooltip || 'Sources');
    this._emptyLabel = options.emptyLabel || 'No sources';

    this._items = Array.isArray(options.items) ? options.items : [];
    this._selectedIndex =
      Number.isInteger(options.defaultIndex) ? options.defaultIndex : undefined;

    this._onSelected = typeof options.onSelected === 'function' ? options.onSelected : null;

    this._lastActivation = 0;
    this._notifying = false;

    // Detect touch capability once (Video.js flag + browser heuristics)
    this._isTouch =
      (videojs.browser && videojs.browser.TOUCH_ENABLED) ||
      (typeof window !== 'undefined' &&
        ('ontouchstart' in window ||
          (navigator && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0))));

    this.emitTapEvents();
    this._setEnabled(this._items.length > 0);
  }

  buildCSSClass() {
    const empty = !Array.isArray(this._items) || this._items.length === 0;
    return `vjs-source-switcher-button${
      empty ? ' vjs-source-switcher-disabled' : ''
    } ${super.buildCSSClass()}`;
  }

  createItems() {
    if (!Array.isArray(this._items) || this._items.length === 0) {
      const empty = new MenuItem(this.player_, {
        label: this._emptyLabel || 'No sources',
        selectable: false
      });
      empty.addClass('vjs-source-switcher-empty');
      empty.disable();
      return [empty];
    }

    return this._items.map(({ label, value }, index) => {
      const item = new MenuItem(this.player_, {
        label,
        selectable: true,
        selected: index === this._selectedIndex
      });

      item.value = value;
      item._ssIndex = index;

      item.emitTapEvents();

      // Single activation handler, guarded against duplicates
      const activate = (e) => {
        // Basic de-dupe: catch tap->click cascades & rapid taps
        const now = Date.now();
        if (now - this._lastActivation < 250) return;
        this._lastActivation = now;

        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();

        this.setSelected(index);
      };

      // IMPORTANT: attach only one kind of event handler to avoid double-firing
      if (this._isTouch) {
        item.on('tap', activate);
      } else {
        item.on('click', activate);
      }

      // Accessibility: activate via keyboard (Enter/Space)
      item.on('keydown', (e) => {
        const key = e && (e.which || e.keyCode);
        if (key === 13 || key === 32) activate(e);
      });

      return item;
    });
  }

  setItems(items) {
    this._items = Array.isArray(items) ? items : [];
    this._selectedIndex = this._items.length ? 0 : undefined;

    this._setEnabled(this._items.length > 0);
    this._rebuildMenu();
  }

  setSelected(index) {
    if (
      !Array.isArray(this._items) ||
      index == null ||
      index < 0 ||
      index >= this._items.length
    ) {
      return;
    }

    // No-op if selecting the currently selected item
    if (this._selectedIndex === index) return;
    this._selectedIndex = index;

    if (this.menu && typeof this.menu.children === 'function') {
      this.menu.children().forEach((child) => {
        if (child instanceof MenuItem) {
          child.selected(child._ssIndex === index);
        }
      });
    }

    const { label, value } = this._items[index];
    const payload = { index, value, label };

    if (!this._notifying) {
      this._notifying = true;
      try {
        if (this._onSelected) this._onSelected(payload, this.player_);
        this.player_.trigger('sourceswitcher:change', payload);
      } finally {
        this._notifying = false;
      }
    }
  }

  setOnSelected(fn) {
    this._onSelected = typeof fn === 'function' ? fn : null;
  }

  _rebuildMenu() {
    if (!this.menu) return;

    // Remove existing children
    const children = this.menu.children ? this.menu.children().slice() : [];
    children.forEach((c) => this.menu.removeChild(c));

    // Add new items
    this.createItems().forEach((i) => this.menu.addItem(i));

    // Toggle disabled class based on emptiness
    const el = this.el && this.el();
    if (el) {
      const empty = this._items.length === 0;
      el.classList.toggle('vjs-source-switcher-disabled', empty);
      el.setAttribute('aria-disabled', String(empty));
    }
  }

  _setEnabled(enabled) {
    const el = this.el && this.el();
    if (!el) return;
    el.classList.toggle('vjs-source-switcher-disabled', !enabled);
    el.setAttribute('aria-disabled', String(!enabled));
  }
}

videojs.registerComponent('sourceSwitcherButton', SourceSwitcherButton);
export default SourceSwitcherButton;
