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
    const button = videojs.dom.createEl('button', {
      className: 'vjs-control vjs-share-download-button vjs-button',
      ariaLabel: 'Download video',
      title: 'Download video'
    });

    const iconSpan = videojs.dom.createEl('span', {
      className: 'vjs-icon-file-download vjs-icon-placeholder'
    });
    button.appendChild(iconSpan);

    const spinnerSpan = videojs.dom.createEl('span', {
      className: 'vjs-loading-spinner'
    });
    button.appendChild(spinnerSpan);

    return button;
  }

  /**
   * Toggles the "preparing download" visual state (spinner + title).
   * @param {boolean} isPreparing
   */
  setPreparing(isPreparing) {
    const el = this.el();
    if (isPreparing) {
      el.classList.add('vjs-waiting');
      el.setAttribute('title', 'Download is being prepared');
    } else {
      el.classList.remove('vjs-waiting');
      el.setAttribute('title', 'Download video');
    }
  }
}

videojs.registerComponent('ShareDownloadButton', ShareDownloadButton);

export default ShareDownloadButton;
