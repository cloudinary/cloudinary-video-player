import videojs from 'video.js';

const ClickableComponent = videojs.getComponent('ClickableComponent');
const dom = videojs.dom || videojs;


class ShoppablePanelItem extends ClickableComponent {
  constructor(player, options) {
    super(player, options);
    this.options_ = options;
  }

  handleClick(event) {
    super.handleClick(event);
  }


  isCurrent() {
    return this.options_.current;
  }

  getTitle() {
    return 'test';
  }


  createEl() {
    const el = super.createEl('a', {
      className: 'cld-thumbnail',
      href: '#'
    }
    );
    const img = super.createEl('img', {
      className: 'cld-shoppable-thumbnail-img',
      src: this.options_.item.url()
    });
    el.appendChild(img);

    el.classList.add('cld-plw-panel-item');

    const info = dom.createEl('div', { className: 'cld-plw-item-info-wrap' });
    const titleWrap = dom.createEl('div', { className: 'cld-plw-item-title' });

    /*
    if (this.isCurrent()) {
      el.classList.add('cld-plw-panel-item-active');

      const currEl = dom.createEl('span', {
        className: 'cld-plw-item-title-curr'
      }, {}, 'Now Playing: ');

      titleWrap.appendChild(currEl);
    }
*/

    const title = dom.createEl('span', { className: 'cld-plw-item-title' }, {}, this.getTitle());

    titleWrap.appendChild(title);
    info.appendChild(titleWrap);

    if (el) {
      el.appendChild(info);
    }

    el.appendChild(info);

    return el;
  }
}

videojs.registerComponent('shoppablePanelItem', ShoppablePanelItem);

export default ShoppablePanelItem;
