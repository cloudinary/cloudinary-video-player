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

    // Background - poster + blur effect
    const bgSrc = this.player_.cloudinary.currentPoster();
    bgSrc.transformation([
      bgSrc.transformation().toOptions(),
      { effect: 'blur:3000' }
    ]);

    const panelBg = dom.createEl('div', {
      className: 'cld-spbl-post-play-bg',
      style: 'background-image: url("' + bgSrc.url() + '")'
    });

    const replayBtn = dom.createEl('button',
      {
        className: 'cld-spbl-replay-btn base-color-bg vjs-icon-replay',
        onclick: () => {
          this.player_.trigger('replay');
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

    this.player_.postModal = this.player_.createModal(el, { name: 'postModal', uncloseable: true });

    this.player_.addClass('cld-spbl-post-modal');
    this.player_.postModal.on('beforemodalclose', () => {
      this.player_.removeClass('cld-spbl-post-modal');
    });
  }

  getLayout() {
    return this.layout_;
  }

}

export default ShoppablePostWidget;
