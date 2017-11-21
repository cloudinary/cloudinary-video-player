import videojs from 'video.js';
import flowtype from '../../utils/flowtype';
import { addResizeListener, removeResizeListener } from '../../utils/resize-events';
import RecommendationsOverlayContent from './recommendations-overlay-content';
import RecommendationsOverlayHideButton from './recommendations-overlay-hide-button';
import './recommendations-overlay.scss';

const OVERLAY_SCALE = 0.85;
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

    this._resizeHandler = null;

    this.on(player, 'recommendationschanged', (_, eventData) => {
      this.setItems(...eventData.items);
    });

    this.on(player, 'recommendationsshow', this.open);
    this.on(player, 'recommendationshide', this.close);
    this.on(player, 'sourcechanged', () => {
      this.clearItems();
      this.close();
    });
  }

  open() {
    // Only show controls on close if they were visible from the first place
    this._showControlsOnClose = this.player().controls();
    this.player().controls(false);
    this.el().style.visibility = 'visible';
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
    const el = super.createEl('div', {
      className: 'vjs-recommendations-overlay'
    });

    videojs.addClass(el, 'vjs-recommendations-overlay');

    this._resizeHandler = () => {
      this._content.resizeToFit(this.width() * OVERLAY_SCALE, this.height() * OVERLAY_SCALE);
    };

    addResizeListener(el, this._resizeHandler);
    flowtype(el, { minFont: 14, fontRatio: 60 });

    return el;
  }

  setItems(primary, ...secondary) {
    secondary = secondary.slice(0, MAXIMUM_ITEMS - 1);
    this._content.setItems(primary, ...secondary);
  }

  handleClick() {
    this.stopPropagation();
  }

  dispose() {
    super.dispose();
    removeResizeListener(this.el(), this._resizeHandler);
  }
}

videojs.registerComponent('recommendationsOverlay', RecommendationsOverlay);

export default RecommendationsOverlay;
