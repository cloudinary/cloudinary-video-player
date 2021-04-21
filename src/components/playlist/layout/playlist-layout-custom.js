import PlaylistLayout from './playlist-layout';

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
