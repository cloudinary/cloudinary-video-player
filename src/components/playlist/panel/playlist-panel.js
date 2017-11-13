import videojs from 'video.js';
import 'assets/styles/components/playlist.scss';
import PlaylistPanelItem from './playlist-panel-item';

const dom = videojs.dom || videojs;
 
const Component = videojs.getComponent('Component');

class PlaylistPanel extends Component {
   
  constructor(player, options = {}) {
    super(player, options);    

    player.on("playlistitemchanged",() => {
      this.render();
    });

    this.render();

  }
  
  dispose() {
      super.dispose();
  }

  createEl() {
      const el = super.createEl();
      el.classList.add('cld-p-panel');

      return el;
  }

  removeAll() {
      const childrens = this.children();
      for (var i = childrens.length - 1; i >= 0; --i) {
          this.removeChild(childrens[i]);
      }
  }

  getItems() {
    const playlist = this.player().cloudinary.playlist();
    
    if(this.options_.showAll)
      return playlist.list();
    
    const startIndex = playlist.currentIndex() + 1;
    const endIndex = startIndex + this.options_.total;
    let selectedItems = playlist.list().slice(startIndex, endIndex);
    
    if(selectedItems.length < this.options_.total) {
      selectedItems = [...selectedItems, ...playlist.list().slice(0, this.options_.total - selectedItems.length)];
    }

    return selectedItems;

  }

  render() {

    const el = this.el();
    const items = this.getItems();
    
    this.removeAll();

    items.forEach((source,index) => {
      const playlistItem = new PlaylistPanelItem(this.player(),videojs.mergeOptions(this.options_,{
          item: source,
          next: index == 0
      })); 

      const itemCls = "cld-flex-col-" + (this.options_.total > 3 ? 4 : this.options_.total);
      playlistItem.addClass(itemCls);
      this.addChild(playlistItem);
      
    });

  }
}

videojs.registerComponent('playlistPanel', PlaylistPanel);

export default PlaylistPanel;