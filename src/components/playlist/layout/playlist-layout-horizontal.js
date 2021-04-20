import PlaylistLayout from './playlist-layout';

export default class PlaylistLayoutHorizontal extends PlaylistLayout {

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
