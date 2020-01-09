import videojs from 'video.js';
import ShoppableBarLayout from './layout/bar-layout';
import './shoppable-widget.scss';

const OPTIONS_DEFAULTS = {
  location: 'right',
  toggleIcon: '',
  width: '20%',
  transformation: {},
  products: []
};

class ShoppableWidget {
  constructor(player, options = {}) {
    this.options_ = videojs.mergeOptions(OPTIONS_DEFAULTS, options);
    this.player_ = player;
    this.render();

    const injectCSS = (css) => {
      const style = document.createElement('style');
      style.innerHTML = css;
      player.el_.appendChild(style);
    };

    const width = options.width || '20%';
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

    this.dispose = () => {
      this.layout_.dispose();
    };
  }

  render() {
    this.layout_ = new ShoppableBarLayout(this.player_, this.options_);
  }

  getLayout() {
    return this.layout_;
  }

}


export default ShoppableWidget;
