import videojs from 'video.js';
import RecommendationsOverlayItem from './recommendations-overlay-item';
import componentUtils from 'components/component-utils';

// support VJS5 & VJS6 at the same time
const dom = videojs.dom || videojs;

class RecommendationsOverlayPrimaryItem extends RecommendationsOverlayItem {

  setItem(item) {
    super.setItem(item);

    const info = this.source.info();

    this.setTitle(info.title);
    this.setSubtitle(info.subtitle);

    if (info.description) {
      const descLength = 300;
      const description = info.description.length > descLength ? info.description.substring(0, descLength) + '...' : info.description;
      this.setDescription(description);
    }
  }

  setPoster(url) {
    this.poster.style.backgroundImage = `url('${url}')`;
  }

  setTitle(text) {
    componentUtils.setText(this.title, text);
    this.setAriaCheck(this.title, !!text);
  }

  setSubtitle(text) {
    componentUtils.setText(this.subtitle, text);
    this.setAriaCheck(this.subtitle, !!text);
  }

  setDescription(text) {
    componentUtils.setText(this.description, text);
    this.setAriaCheck(this.description, !!text);
  }

  setAriaCheck(element, active = true) {
    if (active) {
      element.removeAttribute('aria-hidden');
    } else {
      element.setAttribute('aria-hidden', 'true');
    }
  }

  clearItem() {
    this.setTitle('');
    this.setSubtitle('');
    this.setDescription('');
    this.poster.style.backgroundImage = null;
  }

  createEl() {
    const el = super.createEl('div', {
      className: 'vjs-recommendations-overlay-item vjs-recommendations-overlay-item-primary'
    });

    this.poster = dom.createEl('div', {
      className: 'vjs-recommendations-overlay-item-primary-image'
    });

    this.title = dom.createEl('h2', {
      ariaLabel: 'Recmmendation Title'
    });
    this.setAriaCheck(this.title, false);
    this.title.innerHTML = '';

    this.subtitle = dom.createEl('h3', {
      ariaLabel: 'Recmmendation Subtitle'
    });
    this.setAriaCheck(this.subtitle, false);
    this.subtitle.innerHTML = '';

    this.description = dom.createEl('p');
    this.setAriaCheck(this.description, false);
    this.description.innerHTML = '';

    this.content = dom.createEl('div', {
      className: 'vjs-recommendations-overlay-item-info vjs-recommendations-overlay-item-primary-content'
    });

    this.content.appendChild(this.title);
    this.content.appendChild(this.subtitle);
    this.content.appendChild(this.description);

    el.appendChild(this.poster);
    el.appendChild(this.content);

    return el;
  }
}

export default RecommendationsOverlayPrimaryItem;
