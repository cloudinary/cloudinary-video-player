import videojs from 'video.js';
import RecommendationsOverlaySecondaryItem from './recommendations-overlay-secondary-item';

const Component = videojs.getComponent('Component');

class RecommendationsOverlaySecondaryItemsContainer extends Component {

  setItems(...items) {
    this.clearItems();

    if (!items) {
      return;
    }

    items.forEach((item) => {
      const component = new RecommendationsOverlaySecondaryItem(this.player());
      component.setItem(item);
      this.addChild(component);
    });
  }

  clearItems() {
    this.children().forEach(() => {
      this.removeChild(this.children()[0]);
    });
  }

  createEl() {
    return super.createEl('div', {
      className: 'vjs-recommendations-overlay-item-secondary-container'
    });
  }
}

export default RecommendationsOverlaySecondaryItemsContainer;
