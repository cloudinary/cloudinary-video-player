import videojs from 'utils/videojs';
import SourceMenuItem from './SourceMenuItem.js';

const MenuButton = videojs.getComponent('MenuButton');

/**
 * A button that hides/shows sorted SourceMenuItems
 */
class SourceMenuButton extends MenuButton {

  /**
   * Create SourceMenuItems and sort them
   *
   * @param {videojs.Player} player
   * videojs player
   * @param {{default}} options
   * high | low
   */
  constructor(player, options) {
    super(player, options);

    const qualityLevels = this.player_.qualityLevels();

    // Handle options: We accept an options.default value of ( high || low )
    // This determines a bias to set initial resolution selection.
    if (options && options.default) {
      if (options.default === 'low') {
        for (const [index, qualityLevel] of qualityLevels.entries()) {
          qualityLevel.enabled = (index === 0);
        }
      } else if (options.default === 'high') {
        for (let index = 0; index < qualityLevels.length; index++) {
          qualityLevels[index].enabled = (index === (qualityLevels.length - 1));
        }
      }
    }

    // Bind update to qualityLevels changes
    this.player_.qualityLevels().on(['change', 'addqualitylevel', 'removequalitylevel'], this.update.bind(this));
  }

  /**
   * Create div with videojs classes
   *
   * @returns {videojs.MenuButton} The sum of the two numbers.
   */
  createEl() {
    return videojs.dom.createEl('div', {
      className: 'vjs-http-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button'
    });
  }

  /**
   * Create SourceMenuItems and sort them
   *
   * @returns {SourceMenuItem[]} The sum of the two numbers.
   */
  buildCSSClass() {
    return MenuButton.prototype.buildCSSClass.call(this);
  }

  /**
   * Update the menu button
   *
   * @returns {videojs.MenuButton} The updated menu button
   */
  update() {
    return MenuButton.prototype.update.call(this);
  }

  /**
   * Create SourceMenuItems and sort them
   *
   * @returns {SourceMenuItem[]} Sorted array of SourceMenuItems
   */
  createItems() {
    const menuItems = [];
    const levels = this.player_.qualityLevels();
    const labels = [];

    for (let index = levels.length - 1; index >= 0; index--) {
      const selected = (index === levels.selectedIndex);

      // Display height if height metadata is provided with the stream, else use bitrate
      let label = `${index}`;
      let sortValue = index;
      const level = levels[index];

      if (level.height) {
        label = `${level.height}p`;
        sortValue = Number.parseInt(level.height, 10);
      } else if (level.bitrate) {
        label = `${Math.floor(level.bitrate / 1e3)} kbps`;
        sortValue = Number.parseInt(level.bitrate, 10);
      }

      // Skip duplicate labels
      if (labels.includes(label)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      labels.push(label);

      menuItems.push(new SourceMenuItem(this.player_, { label, index, selected, sortValue }));
    }

    // If there are multiple quality levels, offer an 'auto' option
    if (levels.length > 1) {
      menuItems.push(new SourceMenuItem(this.player_, { label: 'Auto', index: levels.length, selected: false, sortValue: 999999 }));
    }

    // Sort menu items by their label name with Auto always first
    menuItems.sort(function(a, b) {
      return b.options_.sortValue - a.options_.sortValue;
    });

    return menuItems;
  }
}

export default SourceMenuButton;
