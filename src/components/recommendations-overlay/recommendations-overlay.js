import videojs from 'video.js';
import RecommendationsOverlayContent from './recommendations-overlay-content';
import RecommendationsOverlayHideButton from './recommendations-overlay-hide-button';
import './recommendations-overlay.scss';

const MAXIMUM_ITEMS = 4;
const Component = videojs.getComponent('Component');

// TODO: Use Video.js's ModalDialog instead. It handles clicking block logic.
class RecommendationsOverlay extends Component {

  constructor(player, options, ...args) {
    super(player, ...args);

    this._content = new RecommendationsOverlayContent(player);

    this.addChild(this._content);

    this.addChild(new RecommendationsOverlayHideButton(player, { clickHandler: () => {
      this.close();
    } }, ...args));

    this.setEvents(player);

    this.doNotOpen = false;
  }

  setEvents(player) {
    this.on(player, 'recommendationschanged', (_, eventData) => {
      this.setItems(...eventData.items);
    });

    this.on(player, 'recommendationsnoshow', this.setDoNotOpen);
    this.on(player, 'recommendationsshow', this.open);
    this.on(player, 'recommendationshide', this.close);
    this.on(player, 'cldsourcechanged', () => {
      this.clearItems();
      this.close();
    });
  }

  setDoNotOpen() {
    this.doNotOpen = true;
  }

  open() {
    if (!this.doNotOpen) {
      // Only show controls on close if they were visible from the first place
      this._showControlsOnClose = this.player().controls();
      this.player().controls(false);
      this.el().style.visibility = 'visible';
    }
  }

  clearItems() {
    this._content.clearItems();
  }

  close() {
    this.el().style.visibility = 'hidden';
    if (this._showControlsOnClose) {
      this.player().controls(true);
    }
  }

  createEl() {
    const recommendationsOverlayClass = 'vjs-recommendations-overlay';

    const el = super.createEl('div', {
      className: recommendationsOverlayClass
    });
    videojs.dom.addClass(el, recommendationsOverlayClass);

    return el;
  }

  setItems(primary, ...secondary) {
    this.doNotOpen = false;
    secondary = secondary.slice(0, MAXIMUM_ITEMS - 1);
    this._content.setItems(primary, ...secondary);
  }

  handleClick() {
    this.stopPropagation();
  }

  dispose() {
    super.dispose();
  }
}

videojs.registerComponent('recommendationsOverlay', RecommendationsOverlay);

export default RecommendationsOverlay;
