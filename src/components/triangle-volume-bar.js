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

    this.container = dom.createEl('div', {
      className: 'vjs-triangle-volume-bar-container'
    });

    this.bar = this;

    this.container.appendChild(bg);
    this.container.appendChild(this.level);

    const el = Slider.prototype.createEl.call(this, 'div', {
      className: 'vjs-triangle-volume-bar vjs-control'
    });

    videojs.dom.removeClass(el, 'vjs-slider');

    el.appendChild(this.container);

    return el;
  }

  width() {
    return this.container.offsetWidth;
  }

  height() {
    return this.container.offsetHeight;
  }

  update() {
    // In VolumeBar init we have a setTimeout for update that pops and update
    // to the end of the execution stack. The player is destroyed before then
    // update will cause an error
    if (!this.el_) {
      return;
    }

    // If scrubbing, we could use a cached value to make the handle keep up
    // with the user's mouse. On HTML5 browsers scrubbing is really smooth, but
    // some flash players are slow, so we might want to utilize this later.
    // var progress =  (this.player_.scrubbing()) ? this.player_.getCache().currentTime / this.player_.duration() : this.player_.currentTime() / this.player_.duration();
    let progress = this.getPercent();
    const bar = this.bar;

    // If there's no bar...
    if (!bar) {
      return;
    }

    // Protect against no duration and other division issues
    if (typeof progress !== 'number' ||
      progress < 0 ||
      progress === Infinity) {
      progress = 0;
    }

    // Convert to a percentage for setting
    const percentage = (progress * 100).toFixed(2) + '%';
    const style = bar.el().style;

    // Set the new bar width or height
    if (this.vertical()) {
      style.height = percentage;
    } else {
      style.width = percentage;
    }

    this.level.style.clip = `rect(0px, ${progress * this.width()}px, ${this.height()}px, 0px)`;
    return progress;

  }

  vertical() {
    return false;
  }
}

videojs.registerComponent('volumeBar', TriangleVolumeBar);

export default TriangleVolumeBar;
