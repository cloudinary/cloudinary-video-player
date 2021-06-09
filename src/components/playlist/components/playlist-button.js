import videojs from 'video.js';

// Get the ClickableComponent base class from Video.js
const ClickableComponent = videojs.getComponent('ClickableComponent');

// Create a common class for playlist buttons
class PlaylistButton extends ClickableComponent {

  constructor(player, options) {
    // It is important to invoke the superclass before anything else,
    // to get all the features of components out of the box!
    super(player, options);

    const type = options.type;

    if (!type && type !== 'previous' && type !== 'next') {
      throw new Error('Type must be either \'previous\' or \'next\'');
    }
  }

  // The `createEl` function of a component creates its DOM element.
  createEl() {
    const type = this.options_.type;
    const typeCssClass = `vjs-icon-play-${type}`;

    return videojs.dom.createEl('button', {
      // Prefixing classes of elements within a player with "vjs-"
      // is a convention used in Video.js.
      className: `vjs-control vjs-playlist-button vjs-button ${typeCssClass}`
    });
  }
}

export default PlaylistButton;
