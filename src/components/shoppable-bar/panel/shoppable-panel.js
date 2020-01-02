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
    el.classList.add('cld-plw-panel');

    return el;
  }

  removeAll() {
    const childrens = this.children();
    for (let i = childrens.length - 1; i >= 0; --i) {
      this.removeChild(childrens[i]);
    }
  }

  getItems() {
    let options = {cloudinaryConfig: this.player_.cloudinary.cloudinaryConfig()};
    return this.options.products.map(product => new ImageSource(product.publicId, options));
  }

  render() {
    const items = this.getItems();

    this.removeAll();

    items.forEach((item, index) => {
      const playlistItem = new ShoppablePanelItem(this.player(), {
        item: item,
        next: index === 1,
        current: index === 0
      });

      this.addChild(playlistItem);

    });
  }
}

videojs.registerComponent('shoppablePanel', ShoppablePanel);

export default ShoppablePanel;
