import videojs from 'video.js';
import PlaylistPanel from '../panel/playlist-panel';
import PlaylistLayout from './playlist-layout';
import { setWidth } from '../../../utils/dom';

const dom = videojs.dom || videojs;

class PlaylistLayoutVertical extends PlaylistLayout {
  constructor (player, options) {
    options.wrap = true;
    super(player, options);
    // this.createTwoCols();
    // this.watchVideoDimension();
    this.addChild("PlaylistPanel", options);
  }

  getCls() {
    let cls = super.getCls();
    cls.push("cld-p-vertical");

    return cls;
  }

  setContentElDimensions({ width, height }) {
    const itemHeight = height / this.options_.total;
    const itemWidth = (16 / 9) * itemHeight;

    setWidth(this.contentEl(),itemWidth);
  }    
  
}


export default PlaylistLayoutVertical;