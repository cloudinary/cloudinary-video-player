import videojs from 'video.js';

import RecommendationsOverlayPrimaryItem from './recommendations-overlay-primary-item';
import RecommendationsOverlaySecondaryItemsContainer from './recommendations-overlay-secondary-items-container';

const Component = videojs.getComponent('Component');

class RecommendationsOverlayContent extends Component {

  constructor(player, ...args) {
    super(player, ...args);

    this._content = new AspectRatioContent(player);
    this.addChild(this._content);
  }

  setItems(primary, ...secondary) {
    this._content.setItems(primary, ...secondary);
  }

  clearItems() {
    this._content._primary.clearItem();
    this._content._secondaryContainer.clearItems();
  }

  createEl() {
    return super.createEl('div', {
      className: 'vjs-recommendations-overlay-content'
    });
  }
}

class AspectRatioContent extends Component {

  constructor(player, ...args) {
    super(player, ...args);

    this._primary = new RecommendationsOverlayPrimaryItem(player);
    this._secondaryContainer = new RecommendationsOverlaySecondaryItemsContainer(player);

    this.addChild(this._primary);
    this.addChild(this._secondaryContainer);
  }

  setItems(primary, ...secondary) {
    this._primary.setItem(primary);
    this._secondaryContainer.setItems(...secondary);
  }

  createEl() {
    return super.createEl('div', {
      className: 'aspect-ratio-content'
    });
  }
}

export default RecommendationsOverlayContent;
