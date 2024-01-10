import PlaylistLayout from './playlist-layout';

class PlaylistLayoutHorizontal extends PlaylistLayout {
  constructor (player, options) {
    options.wrap = true;
    super(player, options);
  }

  getCls() {
    const cls = super.getCls();
    cls.push('cld-plw-horizontal');
    return cls;
  }
}

export default PlaylistLayoutHorizontal;
