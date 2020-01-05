import videojs from 'video.js';
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
    el.classList.add('cld-spbl-panel');

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
    return this.options.products.map(product => {
      let conf = {
        onHover: product.onHover,
        onClick: product.onClick
      };
      return {
        imageSrc: new ImageSource(product.publicId, { cloudinaryConfig: cloudinaryConfig }),
        conf: conf
      };
    });
  }

  render() {
    const items = this.getItems();

    this.removeAll();

    items.forEach((item, index) => {
      const shoppablePanelItem = new ShoppablePanelItem(this.player(), {
        item: item.imageSrc,
        conf: item.conf,
        next: index === 1,
        current: index === 0
      });
      shoppablePanelItem.on('mouseover', e => {
        let target = e.currentTarget;
        if (target.dataset.action === 'switch') {
          let img = target.getElementsByTagName('img')[0];
          img.src = target.dataset.switchUrl;
        }
      });
      shoppablePanelItem.on('mouseout', e => {
        let target = e.currentTarget;
        if (target.dataset.action === 'switch') {
          let img = target.getElementsByTagName('img')[0];
          img.src = target.dataset.origUrl;
        }
      });
      this.addChild(shoppablePanelItem);

    });
  }
}

videojs.registerComponent('shoppablePanel', ShoppablePanel);

export default ShoppablePanel;
