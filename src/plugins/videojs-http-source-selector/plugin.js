import videojs from 'utils/videojs';

import SourceMenuButton from './components/SourceMenuButton.js';
import SourceMenuItem from './components/SourceMenuItem.js';

// Default options for the plugin.
const defaults = {};

const Plugin = videojs.getPlugin('plugin');

class httpSourceSelector extends Plugin {

  /**
   * Initialize httpSourceSelector plugin
   *
   * @param {object} player
   * videojs player
   * @param {{default}} options
   * high | low
   */
  constructor(player, options) {
    videojs.registerComponent('SourceMenuButton', SourceMenuButton);
    videojs.registerComponent('SourceMenuItem', SourceMenuItem);
    const merge = videojs.obj && videojs.obj.merge || videojs.mergeOptions;

    const settings = merge(defaults, options);
    super(player, settings);
    this.options_ = settings;
    this.player_ = player;

    this.on(player, 'ready', () => {
      this.reset();
      this.init();
    });
  }

  init() {
    this.player_.addClass('vjs-http-source-selector');
    this.player_.videojsHTTPSouceSelectorInitialized = true;
    if (this.player_.techName_ === 'Html5') {
      this.on(this.player_, 'loadedmetadata', () => {
        this.metadataLoaded();
      });
    } else {
      console.error(this.player_.techName_ + ' tech is not supported');
      this.reset();
    }
  }

  reset() {
    this.player_.removeClass('vjs-http-source-selector');
    if (this.player_.videojsHTTPSouceSelectorInitialized === true) {
      if (!this.player_.controlBar.getChild('SourceMenuButton')) {
        this.player_.controlBar.removeChild('SourceMenuButton', {});
      }
      this.player_.videojsHTTPSouceSelectorInitialized = false;
    }
  }

  metadataLoaded() {
    const controlBar = this.player_.controlBar;
    const fullscreenToggle = controlBar.getChild('fullscreenToggle');
    if (!controlBar.getChild('SourceMenuButton')) {
      if (fullscreenToggle) {
        controlBar.el().insertBefore(controlBar.addChild('SourceMenuButton').el(), fullscreenToggle.el());
      } else {
        controlBar.el().append(controlBar.addChild('SourceMenuButton').el());
      }
    }
  }
}

const registerPlugin = videojs.registerPlugin;

// Register the plugin with video.js.
registerPlugin('httpSourceSelector', httpSourceSelector);

export default httpSourceSelector;
