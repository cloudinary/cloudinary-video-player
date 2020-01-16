import videojs from 'video.js';
import PostPanel from './panel/shoppable-post-panel.js';

class ShoppablePostWidget {
  constructor(player, options = {}) {
    this.options_ = options;
    this.player_ = player;
    this.render();

    this.dispose = () => {
      this.layout_.dispose();
    };
  }

  render() {
    let panel = new PostPanel(this.player_, this.options_);
    this.player_.createModal(panel.el(), { name: 'postModal' });
  }

  getLayout() {
    return this.layout_;
  }

}


export default ShoppablePostWidget;
