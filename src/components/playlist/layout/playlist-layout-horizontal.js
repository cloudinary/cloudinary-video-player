import videojs from 'video.js';
import PlaylistPanel from '../panel/playlist-panel';
import PlaylistLayout from './playlist-layout';
import { setHeight, setWidth } from '../../../utils/dom';

const dom = videojs.dom || videojs;

class PlaylistLayoutHorizontal extends PlaylistLayout {
  constructor (player, options) {
    options.wrap = true;
    super(player, options);
    // this.createTwoCols();
    // this.watchVideoDimension();
    this.addChild("PlaylistPanel",this.options()); 
  }

  setContentElDimensions({ width, height }) {
    const itemWidth = width / this.options_.total;
    const itemHeight = (9 / 16) * itemWidth;

    setHeight(this.contentEl(),itemHeight);
  }    

  getCls() {
      let cls = super.getCls();
          cls.push("cld-p-horizontal");
    return cls;
  }
}


export default PlaylistLayoutHorizontal;