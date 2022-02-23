import videojs from 'video.js';
import { elMatches } from 'utils/matches';

const ClickableComponent = videojs.getComponent('ClickableComponent');
const dom = videojs.dom || videojs;
import ImageSource from '../../../plugins/cloudinary/models/image-source';
import {
  CLD_SPBL_IMAGE,
  CLD_SPBL_ITEM,
  SHOPPABLE_CLICK_ACTIONS,
  SHOPPABLE_HOVER_ACTIONS
} from '../shoppable-widget.const';

const widthTransformation = { width: 132 };

class ShoppablePanelItem extends ClickableComponent {

  constructor(player, initOptions) {
    super(player, initOptions);
    this.options_ = initOptions;
    this.isDragged = false;
  }

  handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!elMatches(this.el_, `.dragged .${CLD_SPBL_ITEM}`)) {
      // Prevent click event if dragged
      this.options_.clickHandler(event);
    }
    this.isDragged = false;
  }

  getTitle() {
    return this.options_.conf.title;
  }

  createEl() {
    const el = super.createEl('a', {
      className: `${CLD_SPBL_ITEM} base-color-bg accent-color-text`,
      href: '#'
    });

    el.setAttribute('data-product-id', this.options_.conf.productId || '');
    el.setAttribute('data-product-name', this.options_.conf.productName || '');

    if (this.options_.conf.onHover) {
      addOnHover(el, this.options_.conf.onHover, this.options_.item.cloudinaryConfig());
    }
    if (this.options_.conf.onClick) {
      addOnClick(el, this.options_.conf.onClick);
    }

    const img = super.createEl('img',
      { className: CLD_SPBL_IMAGE },
      { src: this.options_.item.url(widthTransformation) }
    );

    el.appendChild(img);

    if (this.getTitle()) {
      const info = dom.createEl('div', { className: 'cld-spbl-item-info base-color-semi-bg text-color-text' });
      const title = dom.createEl('span', { className: 'cld-spbl-item-title' }, {}, this.getTitle());
      info.appendChild(title);
      el.appendChild(info);
    }

    return el;
  }
}

const addOnHover = (el, conf, cldConf) => {
  el.setAttribute('data-hover-action', conf.action);
  if (conf.action === SHOPPABLE_HOVER_ACTIONS.OVERLAY) {
    const overlayText = dom.createEl('span', { className: 'cld-spbl-overlay-text base-color-text' }, {}, conf.args);
    const overlay = dom.createEl('span', { className: 'cld-spbl-overlay text-color-semi-bg base-color-text' }, { title: conf.args }, overlayText);
    el.appendChild(overlay);
  } else {

    const switchImgSource = new ImageSource(conf.args.publicId, {
      cloudinaryConfig: cldConf,
      transformation: conf.args.transformation
    });

    const hoverImg = dom.createEl('img',
      { className: `${CLD_SPBL_IMAGE} cld-spbl-hover-img` },
      { src: switchImgSource.url(widthTransformation) }
    );

    el.appendChild(hoverImg);
  }
};

const addOnClick = (el, conf) => {
  el.setAttribute('data-click-action', conf.action);
  el.setAttribute('data-pause', conf.pause);
  if (conf.action === SHOPPABLE_CLICK_ACTIONS.SEEk) {
    el.setAttribute('data-seek', conf.args.time);
  } else if (conf.action === SHOPPABLE_CLICK_ACTIONS.GO_TO) {
    el.setAttribute('data-goto-url', conf.args.url);
  }
};

videojs.registerComponent('shoppablePanelItem', ShoppablePanelItem);

export default ShoppablePanelItem;
