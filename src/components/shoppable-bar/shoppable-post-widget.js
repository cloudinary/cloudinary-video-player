import videojs from 'video.js';
import ShoppablePanel from './panel/shoppable-panel.js';
import { CLD_SPBL_PANEL_CLASS } from './shoppable-widget.const';
const dom = videojs.dom || videojs;

class ShoppablePostWidget {
  constructor(player, options = {}) {
    this.options_ = { ...options, postPlay: true };
    this.player_ = player;
    this.render();

    // Handle drag-to-scroll
    this.handleDragToScroll();

    this.dispose = () => {
      this.layout_.dispose();
    };
  }

  handleDragToScroll() {
    const postModal = this.player_.postModal.el_;
    const slider = postModal.querySelector(`.${CLD_SPBL_PANEL_CLASS}`);

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    document.addEventListener('mouseup', (e) => {
      isDown = false;
      setTimeout(() => {
        slider.classList.remove('dragged');
      }, 300);

      const x = e.pageX - slider.offsetLeft;
      const walk = x - startX;
      if (Math.abs(walk) > 5) {
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDown) {
        return;
      }
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX);
      slider.scrollLeft = scrollLeft - walk;
      if (Math.abs(walk) > 5 && !slider.classList.contains('dragged')) {
        slider.classList.add('dragged');
      }
    });
  }

  render() {

    this.player_.postModal = null;

    const el = dom.createEl('div', { className: 'cld-spbl-post-play' });
    const panel = new ShoppablePanel(this.player_, this.options_);

    const title = dom.createEl('div', { className: 'cld-spbl-post-title base-color-text' }, {}, this.options_.bannerMsg || 'Shop the Video');

    // Background - poster + blur effect
    const bgSrc = this.player_.cloudinary.currentPoster();
    bgSrc.transformation([
      bgSrc.transformation().toOptions(),
      { effect: 'blur:3000' }
    ]);

    const panelBg = dom.createEl('div', {
      className: 'cld-spbl-post-play-bg',
      style: `background-image: url("${bgSrc.url()}")`
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
    el.appendChild(title);
    el.appendChild(panel.el());
    el.appendChild(replayBtn);

    this.player_.postModal = this.player_.createModal(el, { name: 'postModal', uncloseable: true });

    this.player_.addClass('cld-spbl-post-modal');
    this.player_.postModal.on('beforemodalclose', () => {
      this.player_.removeClass('cld-spbl-post-modal');
    });
  }

}

export default ShoppablePostWidget;
