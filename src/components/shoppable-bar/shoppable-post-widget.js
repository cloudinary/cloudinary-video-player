import videojs from 'video.js';
import ShoppablePanel from './panel/shoppable-panel.js';
const dom = videojs.dom || videojs;

class ShoppablePostWidget {
  constructor(player, options = {}) {
    this.options_ = { ...options, postPlay: true };
    this.player_ = player;
    this.render();

    this.dispose = () => {
      this.layout_.dispose();
    };
  }

  render() {

    this.player_.postModal = null;

    const el = dom.createEl('div', { className: 'cld-spbl-post-play' });
    const panel = new ShoppablePanel(this.player_, this.options_);
    const panelBg = dom.createEl('div', { className: 'cld-spbl-post-play-bg base-color-bg' });
    const replayBtn = dom.createEl('button',
      {
        className: 'cld-spbl-replay-btn base-color-bg vjs-icon-replay',
        onclick: () => {
          this.player_.postModal.close();
          this.player_.play();
        }
      },
      {},
      'Replay'
    );

    el.appendChild(panelBg);
    el.appendChild(panel.el());
    el.appendChild(replayBtn);

    this.player_.postModal = this.player_.createModal(el, { name: 'postModal' });
  }

  getLayout() {
    return this.layout_;
  }

}


export default ShoppablePostWidget;
