import videojs from 'video.js';
import 'assets/styles/components/triangle-volume-bar.scss';

// support VJS5 & VJS6 at the same time
const dom = videojs.dom || videojs;

const VolumeBar = videojs.getComponent('VolumeBar');
const Slider = videojs.getComponent('Slider');

class TriangleVolumeBar extends VolumeBar {
  createEl() {
    const bg = dom.createEl('div', {
      className: 'vjs-triangle-volume-bar-background'
    });

    this.level = dom.createEl('div', {
      className: 'vjs-triangle-volume-bar-level'
    });

    const container = dom.createEl('div', {
      className: 'vjs-triangle-volume-bar-container'
    });

    this.bar = this;

    container.appendChild(bg);
    container.appendChild(this.level);

    const el = Slider.prototype.createEl.call(this, 'div', {
      className: 'vjs-triangle-volume-bar vjs-control'
    });

    videojs.removeClass(el, 'vjs-slider');

    el.appendChild(container);

    return el;
  }

  width() {
    return this.el().offsetWidth;
  }

  height() {
    return this.el().offsetHeight;
  }

  update() {
    let progress = this.getPercent();

    // Protect against no duration and other division issues
    if (typeof progress !== 'number' ||
        progress < 0 ||
        progress === Infinity) {
      progress = 0;
    }

    this.level.style.clip = `rect(0px, ${progress * this.width()}px, ${this.height()}px, 0px)`;
  }

  vertical() {
    return false;
  }
}

videojs.registerComponent('TriangleVolumeBar', TriangleVolumeBar);

export default TriangleVolumeBar;
