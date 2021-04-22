import PlaylistLayout from './playlist-layout';

class PlaylistLayoutVertical extends PlaylistLayout {

  constructor (player, options) {
    options.wrap = true;
    super(player, options);
  }

  getCls() {
    const cls = super.getCls();
    cls.push('cld-plw-vertical');

    return cls;
  }
}


export default PlaylistLayoutVertical;
