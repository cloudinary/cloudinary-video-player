import videojs from 'video.js';
import flowtype from '../../utils/flowtype';
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
      flowtype(component.el(), { minFont: 10, fontRatio: 25 });
    });
  }

  clearItems() {
    let childrenSize = this.children().length;

    for (let i = 0; i < childrenSize; ++i) {
      this.removeChild(this.children()[0]);
    }
  }

  createEl() {
    return super.createEl('div', {
      className: 'vjs-recommendations-overlay-item-secondary-container'
    });
  }
}

export default RecommendationsOverlaySecondaryItemsContainer;
