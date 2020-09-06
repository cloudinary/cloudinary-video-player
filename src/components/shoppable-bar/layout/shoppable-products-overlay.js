import videojs from 'video.js';
const dom = videojs.dom || videojs;
import { parseTime } from 'utils/time';
import { find } from 'utils/find';

const Component = videojs.getComponent('Component');

class ShoppableProductsOverlay extends Component {

  constructor(player, options = {}) {
    super(player, options);
    this.options_ = options;
    this.player_ = player;

    this.player_.on('showProductsOverlay', () => {
      this.renderProducts();
    });

    this.dispose = () => {
      this.layout_.dispose();
    };
  }

  renderProducts() {
    // Close products side-panel
    this.player_.removeClass('shoppable-panel-visible');
    this.player_.addClass('shoppable-panel-hidden');
    this.player_.addClass('shoppable-products-overlay');

    this.layout_.innerHTML = '';

    // Filter products with appearance on currentTime
    const currentTime = this.player_.currentTime();
    const currentProducts = this.options_.products.filter(product => product.hotspots && product.hotspots.some(a => parseTime(a.time) === currentTime));

    currentProducts.forEach(product => {
      const hotspot = find(product.hotspots, (hs) => parseTime(hs.time) === currentTime);

      const productName = dom.createEl('div',
        { className: 'cld-spbl-product-hotspot-name' },
        {},
        product.productName
      );
      const productTooltip = dom.createEl('div',
        { className: 'cld-spbl-product-tooltip cld-spbl-product-tooltip-' + hotspot.tooltipPosition },
        {},
        productName
      );
      const productHotSpot = dom.createEl('a',
        {
          className: 'cld-spbl-product-hotspot accent-color-text',
          href: hotspot.clickUrl,
          target: '_blank'
        },
        { style: 'left:' + hotspot.x + '; top:' + hotspot.y + ';' },
        productTooltip
      );

      this.layout_.appendChild(productHotSpot);
    });

    // Remove
    this.player_.one('seeking', (e) => this.clearLayout(e));
    this.player_.one('play', (e) => this.clearLayout(e));
  }

  clearLayout() {
    this.layout_.innerHTML = '';
    this.player_.removeClass('shoppable-products-overlay');
  }

  createEl() {
    this.layout_ = dom.createEl('div', { className: 'cld-spbl-products-overlay' });

    return this.layout_;
  }

}

videojs.registerComponent('ShoppableProductsOverlay', ShoppableProductsOverlay);

export default ShoppableProductsOverlay;
