import videojs from 'video.js';
import './source-switcher-button.scss';

const MenuButton = videojs.getComponent('MenuButton');
const MenuItem = videojs.getComponent('MenuItem');

class SourceSwitcherButton extends MenuButton {
  constructor(player, options = {}) {
    super(player, options);

    this.controlText(options.tooltip || 'Sources');
    this._emptyLabel = options.emptyLabel || 'No sources';

    this._items = options.items || [];
    this._selectedIndex = Number.isInteger(options.defaultIndex) ? options.defaultIndex : undefined;

    // callbacks (prefer onSelected, but support legacy onSelect)
    const onSelected = typeof options.onSelected === 'function' ? options.onSelected : null;
    const onSelectLegacy = typeof options.onSelect === 'function' ? options.onSelect : null;

    this._onSelected = onSelected || onSelectLegacy || null;
    this._setEnabled(Array.isArray(this._items) && this._items.length > 0);
  }

  buildCSSClass() {
    const empty = !Array.isArray(this._items) || this._items.length === 0;
    return `vjs-source-switcher-button${empty ? ' vjs-source-switcher-disabled' : ''} ${super.buildCSSClass()}`;
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

      item.on('click', () => {
        this.menu.children().forEach((child) => {
          if (child instanceof MenuItem) {
            child.selected(child._ssIndex === index);
          }
        });

        this._selectedIndex = index;
        const payload = { index, value, label };
        if (this._onSelected) this._onSelected(payload, this.player_);
        this.player_.trigger('sourceswitcher:change', payload);
      });

      return item;
    });
  }

  setItems(items, keepSelection = true) {
    this._items = items;

    if (!keepSelection) {
      this._selectedIndex = this._items.length ? 0 : undefined;
    } else if (
      !Number.isInteger(this._selectedIndex) ||
      this._selectedIndex < 0 ||
      this._selectedIndex >= this._items.length
    ) {
      // keepSelection requested but previous index is invalid now
      this._selectedIndex = this._items.length ? 0 : undefined;
    }

    this._setEnabled(this._items.length > 0);
    this._rebuildMenu();
  }

  setSelected(index) {
    if (
      !Array.isArray(this._items) ||
      index == null ||
      index < 0 ||
      index >= this._items.length
    ) return;

    this._selectedIndex = index;

    // reflect in UI if menu exists
    if (this.menu) {
      this.menu.children().forEach((child) => {
        if (child instanceof MenuItem) {
          child.selected(child._ssIndex === index);
        }
      });
    }

    const { label, value } = this._items[index];
    const payload = { index, value, label };
    if (this._onSelected) this._onSelected(payload, this.player_);
    this.player_.trigger('sourceswitcher:change', payload);
  }

  setOnSelected(fn) {
    this._onSelected = typeof fn === 'function' ? fn : null;
  }

  _rebuildMenu() {
    if (!this.menu) return;
    this.menu.children().slice().forEach((c) => this.menu.removeChild(c));
    this.createItems().forEach((i) => this.menu.addItem(i));

    // Toggle disabled class based on emptiness
    const el = this.el();
    if (el) {
      const empty = this._items.length === 0;
      el.classList.toggle('vjs-source-switcher-disabled', empty);
      el.setAttribute('aria-disabled', String(empty));
    }
  }

  _setEnabled(enabled) {
    const el = this.el();
    if (!el) return;
    el.classList.toggle('vjs-source-switcher-disabled', !enabled);
    el.setAttribute('aria-disabled', String(!enabled));
  }
}

videojs.registerComponent('sourceSwitcherButton', SourceSwitcherButton);
export default SourceSwitcherButton;
