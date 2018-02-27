import PlaylistLayout from './playlist-layout';
import { setWidth } from '../../../utils/dom';

class PlaylistLayoutVertical extends PlaylistLayout {
  constructor (player, options) {
    options.wrap = true;
    super(player, options);
  }

  getCls() {
    let cls = super.getCls();
    cls.push('cld-plw-vertical');

    return cls;
  }

  setContentElDimensions({ height }) {
    const itemHeight = height / this.options_.total;
    const itemWidth = (16 / 9) * itemHeight;

    setWidth(this.contentEl(), itemWidth);
  }
}


export default PlaylistLayoutVertical;
