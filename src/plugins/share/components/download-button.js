import videojs from 'video.js';

const ClickableComponent = videojs.getComponent('ClickableComponent');

class ShareDownloadButton extends ClickableComponent {
  constructor(player, options = {}) {
    super(player, options);
  }

  handleClick(event) {
    super.handleClick(event);
    // Delegate the actual download to the plugin API if present
    if (this.player().share && typeof this.player().share.download === 'function') {
      this.player().share.download();
    }
  }

  createEl() {
    return videojs.dom.createEl('button', {
      className: 'vjs-control vjs-icon-file-download vjs-share-download-button vjs-button',
      ariaLabel: 'Download video'
    });
  }
}

videojs.registerComponent('ShareDownloadButton', ShareDownloadButton);

export default ShareDownloadButton;
