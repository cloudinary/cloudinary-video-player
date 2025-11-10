import videojs from 'video.js';
import SourceMenuItem from './source-switcher-menu-item';

const MenuButton = videojs.getComponent('MenuButton');
const MenuItem = videojs.getComponent('MenuItem');

class SourceSwitcherButton extends MenuButton {
  constructor(player, options = {}) {
    super(player, options);

    this.controlText(options.tooltip || 'Sources');
    this._emptyLabel = options.emptyLabel || 'No sources';
    this._items = Array.isArray(options.items) ? options.items : [];
    this._selectedIndex = Number.isInteger(options.defaultIndex)
      ? options.defaultIndex
      : undefined;
    this._onSelected = typeof options.onSelected === 'function' ? options.onSelected : null;

    this._setEnabled(this._items.length > 0);

    const placeholder = this.el().querySelector('.vjs-icon-placeholder');
    if (placeholder) {
      placeholder.classList.add('vjs-icon-source-switcher');
    }
  }

  buildCSSClass() {
    const empty = !Array.isArray(this._items) || this._items.length === 0;
    return `vjs-source-switcher-button${empty ? ' vjs-source-switcher-disabled' : ''} ${super.buildCSSClass()}`;
  }

  createItems() {
    if (!Array.isArray(this._items) || this._items.length === 0) {
      const empty = new MenuItem(this.player_, {
        label: this._emptyLabel,
        selectable: false
      });
      empty.addClass('vjs-source-switcher-empty');
      empty.disable();
      return [empty];
    }

    return this._items.map(({ label, value }, index) => {
      return new SourceMenuItem(this.player_, {
        label,
        value,
        index,
        selected: index === this._selectedIndex,
        onSelect: (payload) => this._handleItemSelect(payload)
      });
    });
  }

  _handleItemSelect({ index }) {
    if (this._selectedIndex === index) return;
    this.setSelected(index);
  }

  setItems(items) {
    this._items = Array.isArray(items) ? items : [];
    this._selectedIndex = this._items.length ? 0 : undefined;

    this._setEnabled(this._items.length > 0);
    this._rebuildMenu();
  }

  setSelected(index) {
    if (!Array.isArray(this._items) || index == null || index < 0 || index >= this._items.length) return;

    this._selectedIndex = index;

    // reflect in UI if menu exists
    if (this.menu && typeof this.menu.children === 'function') {
      this.menu.children().forEach((child) => {
        if (child instanceof MenuItem) {
          child.selected(child._ssIndex === index);
        }
      });
    }

    const { value } = this._items[index];
    if (this._onSelected) this._onSelected({ index, value }, this.player_);
  }

  setOnSelected(fn) {
    this._onSelected = typeof fn === 'function' ? fn : null;
  }

  _rebuildMenu() {
    if (!this.menu) return;
    this.menu.children().slice().forEach((c) => this.menu.removeChild(c));
    this.createItems().forEach((i) => this.menu.addItem(i));

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
