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

    this.init = () => {
      this.render();
    };

    if (this.options_.showPostPlayOverlay) {
      this.player_.on('ended', () => {
        this.player_.addChild(new ShoppablePostWidget(this.player_, this.options_));
        // Handle responsive images.
        this.player_.player_.cloudinary.cloudinaryConfig().responsive({
          responsive_class: 'cld-vp-responsive'
        });
      });
    }

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

    const resizeHandler = () => {
      const shoppableBarBreakpoints = [
        ['sm', 0, 80],
        ['md', 81, 110],
        ['lg', 111, 170]
      ];
      const shoppableBarWidth = parseFloat(this.options_.width) / 100.0 * player.el_.clientWidth;
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
    };
    this.player_.on('resize', resizeHandler);
    window.addEventListener('resize', resizeHandler);

    this.dispose = () => {
      this.player_.off('resize', resizeHandler);
      window.removeEventListener('resize', resizeHandler);
      this.layout_.dispose();
    };
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
