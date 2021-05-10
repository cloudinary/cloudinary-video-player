import videojs from 'video.js';
import RecommendationsOverlayItem from './recommendations-overlay-item';

// support VJS5 & VJS6 at the same time
const dom = videojs.dom || videojs;

class RecommendationsOverlaySecondaryItem extends RecommendationsOverlayItem {

  setItem(item) {
    super.setItem(item);
    this.setDuration('');
  }

  setPoster(url) {
    this.el().style.backgroundImage = `url('${url}')`;
  }

  setDuration(text) {
    this.duration.innerText = text;
  }

  createEl() {
    const el = super.createEl('div', {
      className: 'vjs-recommendations-overlay-item vjs-recommendations-overlay-item-secondary'
    });

    this.title = dom.createEl('span', { className: 'vjs-recommendations-overlay-item-secondary-title' });
    this.title.innerHTML = '';

    this.duration = dom.createEl('span', { className: 'vjs-recommendations-overlay-item-secondary-duration' });
    this.duration.innerHTML = '';

    const caption = dom.createEl('div', { className: 'vjs-recommendations-overlay-item-info' });
    caption.appendChild(this.title);
    caption.appendChild(this.duration);

    el.appendChild(caption);

    return el;
  }

  handleClick() {
    super.handleClick();
    this.action();
  }
}

export default RecommendationsOverlaySecondaryItem;
