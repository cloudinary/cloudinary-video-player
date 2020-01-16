import ShoppablePanel from './panel/shoppable-panel.js';

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
    let panel = new ShoppablePanel(this.player_, this.options_);
    this.player_.createModal(panel.el(), { name: 'postModal' });
  }

  getLayout() {
    return this.layout_;
  }

}


export default ShoppablePostWidget;
