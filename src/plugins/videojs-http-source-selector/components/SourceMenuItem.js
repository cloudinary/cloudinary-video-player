import videojs from 'video.js';
const MenuItem = videojs.getComponent('MenuItem');
const Component = videojs.getComponent('Component');

/**
 * MenuItem for changing the video source
 *
 * @returns {SourceMenuItem} Sorted array of SourceMenuItems
 */
class SourceMenuItem extends MenuItem {

  /**
   * Create SourceMenuItems and sort them
   *
   * @param {videojs.Player} player
   * A videojs player
   * @param {{label, index, selected, sortValue, selectable: true, multiSelectable: false}} options
   * Multiselectable
   */
  constructor(player, options) {
    options.selectable = true;
    options.multiSelectable = false;

    super(player, options);
  }

  /**
   * Function called whenever a SourceMenuItem is clicked
   */
  handleClick() {
    const selected = this.options_;

    super.handleClick();

    const levels = [...this.player_.qualityLevels().levels_];

    for (const [index, level] of levels.entries()) {
      level.enabled = selected.index === levels.length || selected.index === index;
    }
  }

  /**
   * Create SourceMenuItems and sort them
   */
  update() {
    const selectedIndex = this.player_.qualityLevels().selectedIndex;

    this.selected(this.options_.index === selectedIndex);
  }
}

Component.registerComponent('SourceMenuItem', SourceMenuItem);
export default SourceMenuItem;
