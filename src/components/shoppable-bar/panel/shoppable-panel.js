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
