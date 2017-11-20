import videojs from 'video.js';
import 'assets/styles/components/playlist.scss';
import PlaylistPanelItem from './playlist-panel-item';


const Component = videojs.getComponent('Component');

class PlaylistPanel extends Component {

  constructor(player, options = {}) {
    super(player, options);

    const itemChangeHandler = () => {
      this.render();
    };

    player.on('playlistitemchanged', itemChangeHandler);

    this.render();

    this.dispose = () => {
      super.dispose();
      player.off('playlistitemchanged', itemChangeHandler);
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
    const playlist = this.player().cloudinary.playlist();

    if (this.options_.showAll) {
      return playlist.list();
    }

    const startIndex = playlist.currentIndex() + 1;
    const endIndex = startIndex + this.options_.total;
    let selectedItems = playlist.list().slice(startIndex, endIndex);

    if (selectedItems.length < this.options_.total) {
      selectedItems = [...selectedItems, ...playlist.list().slice(0, this.options_.total - selectedItems.length)];
    }

    return selectedItems;

  }

  render() {
    const items = this.getItems();

    this.removeAll();

    items.forEach((source, index) => {
      const playlistItem = new PlaylistPanelItem(this.player(), videojs.mergeOptions(this.options_, {
        item: source,
        next: index === 0
      }));

      const itemCls = `cld-flex-col-${this.options_.total > 3 ? 4 : this.options_.total}`;
      playlistItem.addClass(itemCls);
      this.addChild(playlistItem);

    });
  }
}

videojs.registerComponent('playlistPanel', PlaylistPanel);

export default PlaylistPanel;
