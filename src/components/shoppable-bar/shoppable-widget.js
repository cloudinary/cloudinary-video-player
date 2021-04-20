import videojs from 'video.js';
import ShoppableBarLayout from './layout/bar-layout';
import ShoppablePostWidget from './shoppable-post-widget';
import './shoppable-widget.scss';

const OPTIONS_DEFAULTS = {
  location: 'right',
  toggleIcon: '',
  width: '20%',
  startState: 'openOnPlay',
  autoClose: 2,
  transformation: {
    quality: 'auto',
    width: 'auto',
    fetch_format: 'auto',
    crop: 'scale'
  },
  products: [],
  showPostPlayOverlay: false
};

class ShoppableWidget {

  constructor(player, options = {}) {
    this.options_ = videojs.mergeOptions(OPTIONS_DEFAULTS, options);
    this.player_ = player;

    if (this.options_.showPostPlayOverlay) {
      this.player_.on('ended', () => {
        this.player_.addChild(new ShoppablePostWidget(this.player_, this.options_));
        // Handle responsive images.
        this.player_.player_.cloudinary.cloudinaryConfig().responsive({
          responsive_class: 'cld-vp-responsive'
        });
      });
    }

    this.setStyle(player);
    this.resizeHandler = this._resizeHandler.bind(this);
    this.player_.on('resize', this.resizeHandler);
    window.addEventListener('resize', this.resizeHandler);
  }

  _resizeHandler() {
    const shoppableBarBreakpoints = [
      ['sm', 0, 80],
      ['md', 81, 110],
      ['lg', 111, 170]
    ];
    const shoppableBarWidth = parseFloat(this.options_.width) / 100.0 * this.player_.el_.clientWidth;
    let inRange = false;

    if (shoppableBarWidth) {
      for (const [name, min, max] of shoppableBarBreakpoints) {
        if (shoppableBarWidth > min && shoppableBarWidth <= max) {
          this.layout_.contentWrpEl_.setAttribute('size', name);
          inRange = name;
        }
      }
      if (!inRange) {
        this.layout_.contentWrpEl_.removeAttribute('size');
      }
    }
  }

  init() {
    this.render();
  }

  setStyle(player) {
    const injectCSS = (css) => {
      const style = document.createElement('style');
      style.innerHTML = css;
      player.el_.appendChild(style);
    };

    const width = this.options_.width;
    injectCSS(`
      .cld-spbl-bar-inner {
        transform: translateX(${width});
      }
      .shoppable-panel-visible .vjs-control-bar {
        width: calc(100% - ${width});
      }
      .cld-spbl-toggle {
        right: ${width};
      }
      .cld-spbl-panel {
        width: ${width};
      }
    `);
  }

  dispose() {
    this.player_.off('resize', this.resizeHandler);
    window.removeEventListener('resize', this.resizeHandler);
    this.layout_.dispose();
  }

  render() {
    this.layout_ = new ShoppableBarLayout(this.player_, this.options_);
    this.player_.on('loadeddata', () => {
      // Handle responsive images.
      this.player_.player_.cloudinary.cloudinaryConfig().responsive({
        responsive_class: 'cld-vp-responsive'
      });
    });
  }

}


export default ShoppableWidget;
