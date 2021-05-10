import videojs from 'video.js';
import Thumbnail from '../thumbnail/thumbnail';

const dom = videojs.dom || videojs;

const DEFAULT_OPTIONS = {
  source: null,
  next: false
};

class PlaylistPanelItem extends Thumbnail {

  constructor(player, initOptions) {
    const options = videojs.mergeOptions(DEFAULT_OPTIONS, initOptions);
    super(player, options);
  }

  handleClick(event) {
    super.handleClick(event);
    this.play();
  }

  play() {
    const item = this.getItem();
    const list = this.player().cloudinary.playlist().list();
    const index = list.indexOf(item);

    if (index === -1) {
      throw new Error('Invalid playlist item...');
    }

    this.player().cloudinary.playlist().playAtIndex(index);
  }

  isCurrent() {
    return this.options_.current;
  }

  getTitle() {
    return super.getTitle();
  }

  getDuration() {
    return super.getDuration();
  }

  createEl() {
    const el = super.createEl();

    el.classList.add('cld-plw-panel-item');

    const info = dom.createEl('div', { className: 'cld-plw-item-info-wrap' });
    const titleWrap = dom.createEl('div', { className: 'cld-plw-item-title' });

    if (this.isCurrent()) {
      el.classList.add('cld-plw-panel-item-active');

      const currEl = dom.createEl('span', {
        className: 'cld-plw-item-title-curr'
      }, {}, 'Now Playing: ');

      titleWrap.appendChild(currEl);
    }

    const title = dom.createEl('span', { className: 'cld-plw-item-title' }, {}, this.getTitle());

    titleWrap.appendChild(title);

    const duration = dom.createEl('div', { className: 'cld-plw-item-duration' }, {}, this.getDuration());

    info.appendChild(titleWrap);
    info.appendChild(duration);

    if (el) {
      el.appendChild(info);
    }

    el.appendChild(info);

    return el;
  }
}

videojs.registerComponent('playlistPanelItem', PlaylistPanelItem);

export default PlaylistPanelItem;
