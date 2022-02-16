import videojs from 'video.js';
import ShoppableBarLayout from './layout/bar-layout';
import ShoppablePostWidget from './shoppable-post-widget';
import './shoppable-widget.scss';
import {
  CLD_SPBL_INNER_BAR,
  CLD_SPBL_PANEL_CLASS,
  CLD_SPBL_TOGGLE_CLASS,
  SHOPPABLE_PANEL_VISIBLE_CLASS,
  SHOPPABLE_WIDGET_OPTIONS_DEFAULTS
} from './shoppable-widget.const';
import { PLAYER_EVENT } from '../../utils/consts';


class ShoppableWidget {

  constructor(player, initOptions = {}) {
    this.options_ = videojs.mergeOptions(SHOPPABLE_WIDGET_OPTIONS_DEFAULTS, initOptions);
    this.player_ = player;

    if (this.options_.showPostPlayOverlay) {
      this.player_.on(PLAYER_EVENT.ENDED, () => {
        this.player_.addChild(new ShoppablePostWidget(this.player_, this.options_));
      });
    }


    const width = this.options_.width;

    this._injectCSS(`
      .${CLD_SPBL_INNER_BAR} {
        transform: translateX(${width});
      }
      .${SHOPPABLE_PANEL_VISIBLE_CLASS} .vjs-control-bar {
        width: calc(100% - ${width});
      }
      .${CLD_SPBL_TOGGLE_CLASS} {
        right: ${width};
      }
      .${CLD_SPBL_PANEL_CLASS}{
        width: ${width};
      }
    `);

    this._setListeners();
  }

  _setListeners() {
    const resizeHandler = this._resizeHandler.bind(this);

    this.player_.on(PLAYER_EVENT.RESIZE, resizeHandler);
    window.addEventListener('resize', resizeHandler);

    this.dispose = () => {
      this.player_.off(PLAYER_EVENT.RESIZE, resizeHandler);
      window.removeEventListener('resize', resizeHandler);
      this.layout_.dispose();
    };
  }

  _injectCSS(css) {
    const style = document.createElement('style');
    style.innerHTML = css;
    this.player_.el_.appendChild(style);
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

  render() {
    this.layout_ = new ShoppableBarLayout(this.player_, this.options_);
  }

}


export default ShoppableWidget;
