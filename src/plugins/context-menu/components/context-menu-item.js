import videojs from 'video.js';

const MenuItem = videojs.getComponent('MenuItem');

class ContextMenuItem extends MenuItem {
  handleClick() {
    super.handleClick();
    this.options_.listener();
  }
}

export default ContextMenuItem;
