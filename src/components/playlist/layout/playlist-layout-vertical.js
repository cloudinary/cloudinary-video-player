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
}


export default PlaylistLayoutVertical;
