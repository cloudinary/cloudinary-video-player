import videojs from 'video.js';
import '../../../assets/styles/components/thumbnail.scss';

// Get the ClickableComponent base class from Video.js
const ClickableComponent = videojs.getComponent('ClickableComponent');

const THUMB_DEFAULT_WIDTH = 300;

const DEFAULT_OPTIONS = {
  item: null,
  transformation: {
    width: THUMB_DEFAULT_WIDTH,
    aspect_ratio: '16:9',
    crop: 'pad',
    background: 'black'
  }
};

class Thumbnail extends ClickableComponent {

  constructor(player, initOptions) {
    const options = videojs.mergeOptions(DEFAULT_OPTIONS, initOptions);
    super(player, options);
  }

  getItem() {
    return this.options_.item;
  }

  getTitle() {
    return this.getItem().info().title;
  }

  getDuration() {
    return ' ';// this.getItem().info().title;
  }

  getThumbnail() {
    return this.getItem().poster().url({ transformation: this.options_.transformation });
  }

  handleClick(e) {
    e.preventDefault();
  }

  createControlTextEl() {
    return;
  }

  createEl(tag = 'a') {
    const el = super.createEl(tag, {
      className: 'cld-thumbnail',
      href: '#'
    });

    const img = super.createEl('img', {
      className: 'cld-thumbnail-img',
      src: this.getThumbnail()
    });

    el.appendChild(img);

    el.style.backgroundImage = `url('${this.getThumbnail()}')`;

    return el;
  }
}

export default Thumbnail;
