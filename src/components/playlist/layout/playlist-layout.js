import videojs from 'video.js';
import { addResizeListener, removeResizeListener } from '../../../utils/resize-events';
import { wrap } from '../../../utils/dom';

const dom = videojs.dom || videojs;
const Component = videojs.getComponent('Component');

const OPTIONS_DEFAULT = {
  wrap: false
};

class PlaylistLayout extends Component {
  constructor(player, options) {
    const layoutOptions = { ...OPTIONS_DEFAULT, ...options };
    super(player, layoutOptions);
    this.player_ = player;
    this.setCls();

    const themeHandler = (e, params) => {
      dom.removeClass(this.el(), `cld-video-player-skin-${params.prevSkin}`);
      dom.addClass(this.el(), `cld-video-player-skin-${params.currSkin}`);
      this.options({
        skin: params.currSkin
      });
    };

    const fluidHandler = (e, fluid) => {
      this.options_.fluid = fluid;
      this.removeCls();
      this.setCls();
    };

    const wrapVideoWithLayout = () => {
      const el = this.el();

      this.videoWrap_ = dom.createEl('div', { className: 'cld-plw-col-player' });
      this.contentEl_ = this.contentEl_ = dom.createEl('div', { className: 'cld-plw-col-list' });

      wrap(this.player().el(), el);

      el.appendChild(this.videoWrap_);
      el.appendChild(this.contentEl_);

      wrap(this.player().el(), this.videoWrap_);
    };

    const changeDimensions = (prev) => {
      prev = prev || { width: 0, height: 0 };

      const videoWidth = this.player_.currentWidth();
      const videoHeight = this.player_.currentHeight();
      const dims = { width: videoWidth, height: videoHeight };

      if (prev.height !== videoHeight || prev.width !== videoWidth) {
        this.setContentElDimensions(dims);
        prev = dims;
      }
    };

    const loadDataHandler = () => {
      changeDimensions();
    };

    const layoutUpdateHandler = () => {
      changeDimensions({ width: 0, height: 0 });
    };

    const resizeHandler = () => {
      this.setContentElDimensions(this.player().currentDimensions());
    };


    if (layoutOptions.wrap) {
      wrapVideoWithLayout();
      // this.player().on("loadeddata",loadDataHandler);
      this.on('playlistlayoutupdate', layoutUpdateHandler);
      addResizeListener(this.el(), resizeHandler);
      changeDimensions();

    }

    player.on('fluid', fluidHandler);
    player.on('themechange', themeHandler);

    this.addChild('PlaylistPanel', this.options());

    this.dispose = () => {
      removeResizeListener(this.el(), resizeHandler);
      super.dispose();
      player.off('fluid', fluidHandler);
      player.off('themechange', themeHandler);
      player.off('loadeddata', loadDataHandler);
      player.off('playlistlayoutupdate', layoutUpdateHandler);

    };
  }

  getCls() {
    let cls = ['cld-plw-layout'];
    cls.push(`cld-video-player-skin-${this.options_.skin}`);
    if (this.options_.fluid) {
      cls.push('cld-plw-layout-fluid');
    }

    return cls;
  }

  setCls() {
    this.getCls().forEach((cls) => {
      this.addClass(cls);
    });
  }

  removeCls() {
    this.getCls().forEach((cls) => {
      this.removeClass(cls);
    });
  }

  update(optionToChange, options) {
    this.options(options);
    this.removeChild('PlaylistPanel');
    this.addChild('PlaylistPanel', this.options_);
    this.trigger('playlistlayoutupdate');
  }

  removeLayout() {
    const parentElem = this.el().parentElement;
    if (this.el().parentElement) {
      parentElem.appendChild(this.player().el());
    }
  }

  createEl() {
    const el = super.createEl('div');

    return el;
  }

}

videojs.registerComponent('playlistLayout', PlaylistLayout);

export default PlaylistLayout;