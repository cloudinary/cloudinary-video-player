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
    const repeat = playlist._repeat;

    if (this.options_.showAll) {
      return playlist.list();
    }

    const items = [];
    const numOfItems = this.options_.total;

    while (items.length < numOfItems) {
      let index = playlist.nextIndex(index);
      if (index === -1) {
        if (!repeat && items.length > 0) {
          break;
        }

        index = 0;
      }

      const source = playlist.list()[index];
      items.push(source);
    }

    return items;
  }

  render() {
    const items = this.getItems();

    this.removeAll();

    items.forEach((source, index) => {
      const playlistItem = new PlaylistPanelItem(this.player(), videojs.mergeOptions(this.options_, {
        item: source,
        next: index === 0
      }));

      const el = playlistItem.el();

      const colWidth = `${100 / this.options_.total}%`;
      el.style.flexBasis = colWidth;
      el.style.WebkitflexBasis = colWidth;

      this.addChild(playlistItem);

    });
  }
}

videojs.registerComponent('playlistPanel', PlaylistPanel);

export default PlaylistPanel;
