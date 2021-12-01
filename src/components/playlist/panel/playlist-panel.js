import videojs from 'video.js';
import 'assets/styles/components/playlist.scss';
import PlaylistPanelItem from './playlist-panel-item';
import { PLAYER_EVENT } from '../../../utils/consts';


const Component = videojs.getComponent('Component');

class PlaylistPanel extends Component {

  constructor(player, options = {}) {
    super(player, options);

    const itemChangeHandler = () => {
      this.render();
    };

    player.on(PLAYER_EVENT.PLAYLIST_ITEM_CHANGED, itemChangeHandler);

    this.render();

    this.dispose = () => {
      super.dispose();
      player.off(PLAYER_EVENT.PLAYLIST_ITEM_CHANGED, itemChangeHandler);
    };
  }

  createEl() {
    const el = super.createEl();
    el.classList.add('cld-plw-panel');

    return el;
  }

  removeAll() {
    const children = this.children();
    for (let i = children.length - 1; i >= 0; --i) {
      this.removeChild(children[i]);
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
    let index = playlist.currentIndex();
    let source = playlist.list()[index];
    items.push(source);

    while (items.length < numOfItems) {
      index = playlist.nextIndex(index);
      if (index === -1) {
        if (!repeat && items.length > 0) {
          break;
        }

        index = 0;
      }

      source = playlist.list()[index];
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
        next: index === 1,
        current: index === 0
      }));

      this.addChild(playlistItem);

    });
  }
}

videojs.registerComponent('playlistPanel', PlaylistPanel);

export default PlaylistPanel;
