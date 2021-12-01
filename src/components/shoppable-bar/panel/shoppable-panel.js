import videojs from 'video.js';
import { assign } from 'utils/assign';
import { throttle } from 'utils/throttle';
import { parseTime } from 'utils/time';
import 'assets/styles/components/playlist.scss';
import ShoppablePanelItem from './shoppable-panel-item';
import ImageSource from '../../../plugins/cloudinary/models/image-source';
import {
  CLD_SPBL_PANEL_CLASS,
  SHOPPABLE_CLICK_ACTIONS,
  SHOPPABLE_PANEL_HIDDEN_CLASS,
  SHOPPABLE_PANEL_VISIBLE_CLASS,
  SHOPPABLE_PRODUCTS_OVERLAY_CLASS
} from '../shoppable-widget.const';
import { PLAYER_EVENT } from '../../../utils/consts';

const Component = videojs.getComponent('Component');

class ShoppablePanel extends Component {

  constructor(player, options = {}) {
    super(player, options);
    this.options = options;

    const itemChangeHandler = () => {
      this.render();
    };

    player.on(PLAYER_EVENT.SHOPPABLE_ITEM_CHANGED, itemChangeHandler);

    this.render();

    this.dispose = () => {
      super.dispose();
      player.off(PLAYER_EVENT.SHOPPABLE_ITEM_CHANGED, itemChangeHandler);
    };
  }

  createEl() {
    const el = super.createEl();
    [CLD_SPBL_PANEL_CLASS, 'base-color-bg'].map(cls => el.classList.add(cls));
    return el;
  }

  removeAll() {
    const childrens = this.children();
    for (let i = childrens.length - 1; i >= 0; --i) {
      this.removeChild(childrens[i]);
    }
  }

  getItems() {
    const cloudinaryConfig = this.player_.cloudinary.cloudinaryConfig();
    return this.options.products.map(product => {
      if (product.onHover && typeof product.onHover.args === 'object') {
        product.onHover.args.transformation = assign({},
          this.options.transformation,
          product.onHover.args.transformation
        );
      }
      const conf = {
        productId: product.productId,
        productName: product.productName,
        title: product.title,
        onHover: product.onHover,
        onClick: product.onClick,
        startTime: product.startTime,
        endTime: product.endTime
      };
      const imageSource = new ImageSource(product.publicId, {
        cloudinaryConfig: cloudinaryConfig,
        transformation: assign({}, this.options.transformation, product.transformation)
      });
      return {
        imageSrc: imageSource,
        conf: conf
      };
    });
  }

  scrollToActiveItem() {
    const activeItems = this.el_.getElementsByClassName('active');
    if (activeItems.length > 0) {
      const toScroll = activeItems[0].offsetTop - 12;
      // Test for native scrollTo support (IE will fail)
      if ('scrollBehavior' in document.documentElement.style) {
        this.el_.scrollTo({
          top: toScroll,
          behavior: 'smooth'
        });
      } else {
        this.el_.scrollTop = toScroll;
      }
    }
  }

  render() {
    this.removeAll();

    const items = this.getItems();

    const throttledScrollToActiveItem = throttle(() => this.scrollToActiveItem(), 1000);

    items.forEach((item, index) => {
      const shoppablePanelItem = new ShoppablePanelItem(this.player(), {
        item: item.imageSrc,
        conf: item.conf,
        next: index === 1,
        current: index === 0,
        clickHandler: (e) => {
          let target = e.currentTarget || e.target;
          let evName = this.player_.ended() ? 'productClickPost' : 'productClick';
          this.player_.trigger(evName, { productId: target.dataset.productId, productName: target.dataset.productName });

          // Go to URL, or seek video (set currentTime)
          if (target.dataset.clickAction === SHOPPABLE_CLICK_ACTIONS.GO_TO) {
            window.open(target.dataset.gotoUrl, '_blank');
          } else if (target.dataset.clickAction === SHOPPABLE_CLICK_ACTIONS.SEEk) {
            const gotoSecs = parseTime(target.dataset.seek);
            if (gotoSecs !== null) {
              this.player_.addClass('vjs-has-started'); // Hide the poster image
              if (this.player_.postModal) {
                this.player_.postModal.close();
              }
              this.player_.currentTime(gotoSecs);
              // Close products side-panel
              this.player_.removeClass(SHOPPABLE_PANEL_VISIBLE_CLASS);
              this.player_.addClass(SHOPPABLE_PANEL_HIDDEN_CLASS);
              this.player_.addClass(SHOPPABLE_PRODUCTS_OVERLAY_CLASS);
              // Wait for the time update and show the tooltips
              this.player_.one('seeked', () => this.player_.trigger('showProductsOverlay'));
            }
          }

          // pause - true (default), false, or number of seconds
          if (target.dataset.pause !== 'false') {
            this.player_.pause();
            if (parseTime(target.dataset.pause)) {
              setTimeout(() => {
                this.player_.play();
              }, parseTime(target.dataset.pause) * 1000);
            }
          }
        }
      });

      shoppablePanelItem.on('mouseover', e => {
        let target = e.currentTarget || e.target;
        let evName = this.player_.ended() ? 'productHoverPost' : 'productHover';
        this.player_.trigger(evName, { productId: target.dataset.productId, productName: target.dataset.productName });
      });

      if (typeof item.conf.startTime !== 'undefined' && typeof item.conf.endTime !== 'undefined') {
        this.player_.on(PLAYER_EVENT.TIME_UPDATE, () => {
          const time = this.player_.currentTime();
          if (time >= item.conf.startTime && time < item.conf.endTime) {
            shoppablePanelItem.el_.classList.add('active');
            throttledScrollToActiveItem();
          } else if (shoppablePanelItem.el_.classList.contains('active')) {
            shoppablePanelItem.el_.classList.remove('active');
          }
        });
      }

      this.addChild(shoppablePanelItem);

    });

  }
}

videojs.registerComponent('shoppablePanel', ShoppablePanel);

export default ShoppablePanel;
