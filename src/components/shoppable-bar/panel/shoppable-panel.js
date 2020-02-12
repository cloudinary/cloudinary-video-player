import videojs from 'video.js';
import assign from 'utils/assign';
import throttle from 'utils/throttle';
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
        onClick: product.onClick,
        startTime: product.startTime,
        endTime: product.endTime
      };
      let imgSrc = {
        cloudinaryConfig: cloudinaryConfig,
        transformation: assign({}, globalTrans, product.transformation)
      };
      return {
        imageSrc: new ImageSource(product.publicId, imgSrc),
        conf: conf
      };
    });
  }

  scrollToActiveItem() {
    const activeItems = this.el_.getElementsByClassName('active');
    if (activeItems.length > 0) {
      this.el_.scrollTo({
        top: activeItems[0].offsetTop - 8,
        behavior: 'smooth'
      });
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
          this.player_.trigger('productClick', { productId: target.dataset.productId, productName: target.dataset.productName });

          // Go to URL, or seek video (set currentTime)
          if (target.dataset.clickAction === 'goto') {
            window.open(target.dataset.gotoUrl, '_blank');
          } else if (target.dataset.clickAction === 'seek') {
            // ToDo: extarct to utils and use for startTime & endTime
            let timeParts = target.dataset.seek.split(':');
            let gotoSecs = null;
            if (timeParts.length === 3) {
              gotoSecs = (parseInt(timeParts[0], 10) * 60 * 60) + (parseInt(timeParts[1], 10) * 60) + parseInt(timeParts[2], 10);
            } else {
              gotoSecs = (parseInt(timeParts[0], 10) * 60) + parseInt(timeParts[1], 10);
            }
            if (gotoSecs !== null) {
              this.player_.currentTime(gotoSecs);
              this.player_.addClass('vjs-has-started');
              if (this.player_.postModal) {
                this.player_.postModal.close();
              }
            }
          }

          // pause - true, or number of seconds
          if (target.dataset.pause === 'true') {
            this.player_.pause();
          } else if (!isNaN(target.dataset.pause)) {
            this.player_.pause();
            setTimeout(() => {
              this.player_.play();
            }, target.dataset.pause * 1000);
          }
        }
      });

      shoppablePanelItem.on('mouseover', e => {
        let target = e.currentTarget || e.target;
        this.player_.trigger('productHover', { productId: target.dataset.productId, productName: target.dataset.productName });
        if (target.dataset.hoverAction === 'switch') {
          let img = target.getElementsByTagName('img')[0];
          img.src = target.dataset.switchUrl;
        }
      });

      shoppablePanelItem.on('mouseout', e => {
        let target = e.currentTarget || e.target;
        if (target.dataset.hoverAction === 'switch') {
          let img = target.getElementsByTagName('img')[0];
          img.src = target.dataset.origUrl;
        }
      });

      if (typeof item.conf.startTime !== 'undefined' && typeof item.conf.endTime !== 'undefined') {
        this.player_.on('timeupdate', () => {
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
