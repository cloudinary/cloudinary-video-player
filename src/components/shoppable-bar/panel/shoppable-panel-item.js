import videojs from 'video.js';

const ClickableComponent = videojs.getComponent('ClickableComponent');
const dom = videojs.dom || videojs;
import ImageSource from '../../../plugins/cloudinary/models/image-source';

class ShoppablePanelItem extends ClickableComponent {
  constructor(player, options) {
    super(player, options);
    this.options_ = options;
  }

  getTitle() {
    return 'test';
  }

  createEl() {
    const el = super.createEl('a', {
      className: 'cld-spbl-item',
      href: '#'
    });
    const img = super.createEl('img', {
      className: 'cld-spbl-img',
      src: this.options_.item.url()
    });
    el.appendChild(img);
    if (this.options_.conf.onHover) {
      addOnHoverAction(el, this.options_.conf.onHover, this.options_.item.cloudinaryConfig());
    }
    if (this.options_.conf.onClick) {
      addOnClick(el, this.options_.conf.onClick);
    }

    const info = dom.createEl('div', { className: 'cld-spbl-item-info' });
    const title = dom.createEl('span', { className: 'cld-spbl-item-title' }, {}, this.getTitle());

    info.appendChild(title);
    el.appendChild(info);

    return el;
  }
}

const addOnHoverAction = (el, conf, cldConf) => {
  el.setAttribute('data-hover-action', conf.action);
  if (conf.action === 'tooltip') {
    let tooltip = dom.createEl('span', { className: 'cld-spbl-tooltip' }, {}, conf.args);
    el.appendChild(tooltip);
  } else {
    const switchImgSource = new ImageSource(conf.args, { cloudinaryConfig: cldConf });
    el.setAttribute('data-switch-url', switchImgSource.url());
    el.setAttribute('data-orig-url', el.getElementsByTagName('img')[0].src);
  }
};

const addOnClick = (el, conf) => {
  el.setAttribute('data-click-action', conf.action);
  el.setAttribute('data-pause', conf.pause);
  if (conf.action === 'seek') {
    el.setAttribute('data-seek', conf.args.time);
  } else if (conf.action === 'goto') {
    el.setAttribute('data-goto-url', conf.args.url);
  }
};

videojs.registerComponent('shoppablePanelItem', ShoppablePanelItem);

export default ShoppablePanelItem;
