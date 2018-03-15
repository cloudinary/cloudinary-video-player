import PlaylistLayout from './playlist-layout';
import { setHeight } from '../../../utils/dom';

class PlaylistLayoutHorizontal extends PlaylistLayout {
  constructor (player, options) {
    options.wrap = true;
    super(player, options);
  }

  getCls() {
    let cls = super.getCls();
    cls.push('cld-plw-horizontal');
    return cls;
  }
}

export default PlaylistLayoutHorizontal;
