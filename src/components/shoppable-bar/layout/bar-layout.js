import videojs from 'video.js';

const dom = videojs.dom || videojs;
const Component = videojs.getComponent('Component');
import ShoppableProductsOverlay from './shoppable-products-overlay';
import ShoppablePanelToggle from './shoppable-panel-toggle';

class ShoppableBarLayout extends Component {
  constructor(player, options) {
    super(player, options);
    this.player_ = player;

    this.player().addClass('cld-shoppable-panel');
    this.player().addClass('shoppable-panel-hidden');

    this.contentWrpEl_ = dom.createEl('div', { className: 'cld-spbl-bar' });

    this.contentBannerEl_ = dom.createEl('div', { className: 'cld-spbl-banner-msg base-color-text' }, {}, this.options_.bannerMsg || 'Shop the Video');
    this.contentWrpEl_.appendChild(this.contentBannerEl_);

    const productsOverlay = new ShoppableProductsOverlay(this.player_, this.options_);
    this.contentWrpEl_.appendChild(productsOverlay.el_);

    this.contentEl_ = dom.createEl('div', { className: 'cld-spbl-bar-inner' });
    this.contentWrpEl_.appendChild(this.contentEl_);

    this.player().el().appendChild(this.contentWrpEl_);

    this.addChild(new ShoppablePanelToggle(this.player_, {
      toggleIcon: this.options_.toggleIcon,
      clickHandler: () => {
        this.togglePanel();
      }
    }));

    this.addChild('ShoppablePanel', this.options_);

    this.dispose = () => {
      this.removeLayout();
      super.dispose();
    };

    this.togglePanel = (open) => {
      if (open === true) {
        // Open
        this.player().removeClass('shoppable-panel-hidden');
        this.player().addClass('shoppable-panel-visible');
      } else if (open === false) {
        // Close
        this.player().removeClass('shoppable-panel-visible');
        this.player().addClass('shoppable-panel-hidden');
      } else {
        // Toggle
        this.player().toggleClass('shoppable-panel-hidden');
        this.player().toggleClass('shoppable-panel-visible');
      }
      let eventName = this.player().hasClass('shoppable-panel-visible') ? 'productBarMax' : 'productBarMin';
      this.player().trigger(eventName);
    };

    // Open shoppable
    if (this.options_.startState === 'open') {
      this.togglePanel(true);
    }

    // On play start
    this.player_.on('play', () => {
      if (this.player_.currentTime() < 0.01) {

        // Open shoppable on-play
        if (this.options_.startState === 'openOnPlay') {
          this.togglePanel(true, this.options_.autoClose);
        }

        // Auto-close shoppable
        if (this.options_.autoClose && this.options_.startState.indexOf('open') !== -1) {
          setTimeout(() => {
            // Keep it open while hovered
            if (!this.contentEl_.matches(':hover')) {
              this.togglePanel(false);
            } else {
              this.contentEl_.addEventListener('mouseleave', () => {
                this.togglePanel(false);
              }, { once: true });
            }
          }, this.options_.autoClose * 1000);
        }

      }

    });
  }

  createEl() {
    const el = super.createEl('div');

    return el;
  }

}

videojs.registerComponent('shoppableBarLayout', ShoppableBarLayout);

export default ShoppableBarLayout;
