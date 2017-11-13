import videojs from 'video.js';
import PlaylistPanel from '../panel/playlist-panel';
import PlaylistLayout from './playlist-layout';

const dom = videojs.dom || videojs;

class PlaylistLayoutCustom extends PlaylistLayout {
  getCls() {
    let cls = super.getCls();
    cls.push('cld-plw-custom');

    return cls;
  }

  createEl() {
    const el = super.createEl();
    this.options_.renderTo.appendChild(el);

    return el;
  }
}


export default PlaylistLayoutCustom;