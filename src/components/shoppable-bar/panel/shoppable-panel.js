import videojs from 'video.js';
import assign from 'utils/assign';
import 'assets/styles/components/playlist.scss';
import ShoppablePanelItem from './shoppable-panel-item';
import ImageSource from '../../../plugins/cloudinary/models/image-source';

const Component = videojs.getComponent('Component');

class ShoppablePanel extends Component {
  constructor(player, options = {}) {
    super(player, options);
    this.options = options;

    const itemChangeHandler = () => {
      this.render();
    };

    player.on('shoppableitemchanged', itemChangeHandler);

    this.render();

    this.dispose = () => {
      super.dispose();
      player.off('shoppableitemchanged', itemChangeHandler);
    };
  }

  createEl() {
    const el = super.createEl();
    el.classList.add('cld-spbl-panel', 'base-color-bg');

    return el;
  }

  removeAll() {
    const childrens = this.children();
    for (let i = childrens.length - 1; i >= 0; --i) {
      this.removeChild(childrens[i]);
    }
  }

  getItems() {
    let cloudinaryConfig = this.player_.cloudinary.cloudinaryConfig();
    let globalTrans = this.options.transformation;
    return this.options.products.map(product => {
      let conf = {
        productId: product.productId,
        productName: product.productName,
        title: product.title,
        onHover: product.onHover,
        onClick: product.onClick
      };
      let imgSrc = {
        cloudinaryConfig: cloudinaryConfig,
        transformation: assign(globalTrans, product.transformation)
      };
      return {
        imageSrc: new ImageSource(product.publicId, imgSrc),
        conf: conf
      };
    });
  }

  render() {
    this.removeAll();

    const items = this.getItems();

    items.forEach((item, index) => {
      const shoppablePanelItem = new ShoppablePanelItem(this.player(), {
        item: item.imageSrc,
        conf: item.conf,
        next: index === 1,
        current: index === 0
      });
      shoppablePanelItem.on('mouseover', e => {
        let target = e.currentTarget;
        this.player_.trigger('productHover', { productId: target.dataset.productId, productName: target.dataset.productName });
        if (target.dataset.hoverAction === 'switch') {
          let img = target.getElementsByTagName('img')[0];
          img.src = target.dataset.switchUrl;
        }
      });
      shoppablePanelItem.on('mouseout', e => {
        let target = e.currentTarget;
        if (target.dataset.hoverAction === 'switch') {
          let img = target.getElementsByTagName('img')[0];
          img.src = target.dataset.origUrl;
        }
      });
      shoppablePanelItem.on('click', e => {
        let target = e.currentTarget;
        this.player_.trigger('productClick', { productId: target.dataset.productId, productName: target.dataset.productName });
        if (target.dataset.pause === 'true') {
          this.player_.pause();
        }
        if (target.dataset.clickAction === 'goto') {
          window.open(target.dataset.gotoUrl, '_blank');
        } else if (target.dataset.clickAction === 'seek') {
          let timeParts = target.dataset.seek.split(':');
          let gotoSecs = null;
          if (timeParts.length === 3) {
            gotoSecs = (parseInt(timeParts[0], 10) * 60 * 60) + (parseInt(timeParts[1], 10) * 60) + parseInt(timeParts[2], 10);
          } else {
            gotoSecs = (parseInt(timeParts[0], 10) * 60) + parseInt(timeParts[1], 10);
          }
          if (gotoSecs !== null) {
            this.player_.currentTime(gotoSecs);
          }
        }
      });
      this.addChild(shoppablePanelItem);

    });

  }
}

videojs.registerComponent('shoppablePanel', ShoppablePanel);

export default ShoppablePanel;
