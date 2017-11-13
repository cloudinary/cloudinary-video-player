import videojs from 'video.js';
import Thumbnail from '../../thumbnail/thumbnail';

const dom = videojs.dom || videojs;
const Component = videojs.getComponent('Component');

const DEFAULT_OPTIONS = {
  source: null,
  next: false
};

class PlaylistPanelItem extends Thumbnail {
  constructor(player, options) {
    options = videojs.mergeOptions(DEFAULT_OPTIONS, options);
    super(player, options);
  }

  handleClick(event) {
    super.handleClick(event);
    this.player().cloudinary.playlist().playItem(this.getItem());
  }

  isNext() {
    return this.options().next;
  }


  getTitle() {
    return super.getTitle();
  }

  createEl() {
    const el = super.createEl();

    el.classList.add('cld-playlist-item');

    const info = dom.createEl('div', {
      className: 'cld-p-item-info-wrap'
    });

    const titleWrap = dom.createEl('div', {
      className: 'cld-p-item-title'
    });

    if (this.isNext()) {
      const nextEl = dom.createEl('span', {
        className: 'cld-p-item-title-next'
      }, {}, 'Next Up: ');

      titleWrap.appendChild(nextEl);
    }

    const title = dom.createEl('span', {
      className: 'cld-p-item-title'
    }, {}, this.getTitle());

    titleWrap.appendChild(title);

    const duration = dom.createEl('div', {
      className: 'cld-p-item-duration'
    }, {}, this.getDuration());

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


