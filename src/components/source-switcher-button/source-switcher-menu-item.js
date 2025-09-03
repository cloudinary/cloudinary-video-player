import videojs from 'video.js';

const MenuItem = videojs.getComponent('MenuItem');

class SourceMenuItem extends MenuItem {
  constructor(player, options = {}) {
    super(player, {
      ...options,
      selectable: true,
      multiSelectable: false,
      selected: !!options.selected,
      label: options.label
    });

    this.value = options.value;
    this._ssIndex = options.index;
    this._onSelect = typeof options.onSelect === 'function' ? options.onSelect : null;
  }

  handleClick(event) {
    super.handleClick(event);

    if (this._onSelect) {
      this._onSelect({
        index: this._ssIndex,
        value: this.value,
        label: this.options_.label
      });
    }
  }
}

videojs.registerComponent('SourceMenuItem', SourceMenuItem);
export default SourceMenuItem;
