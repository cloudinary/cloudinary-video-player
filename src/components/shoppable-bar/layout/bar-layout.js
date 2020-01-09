import videojs from 'video.js';

const dom = videojs.dom || videojs;
const Component = videojs.getComponent('Component');
import ShoppablePanelToggle from './shoppable-panel-toggle';

class ShoppableBarLayout extends Component {
  constructor(player, options) {
    super(player, options);
    this.player_ = player;

    this.player().addClass('cld-shoppable-panel');
    this.player().addClass('shoppable-panel-hidden');

    this.contentWrpEl_ = dom.createEl('div', { className: 'cld-spbl-bar' });
    this.contentEl_ = dom.createEl('div', { className: 'cld-spbl-bar-inner' });

    this.contentWrpEl_.appendChild(this.contentEl_);
    this.player().el().appendChild(this.contentWrpEl_);

    const shoppablePanelToggle = new ShoppablePanelToggle(this.player(), this.options_);
    shoppablePanelToggle.on('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.player().toggleClass('shoppable-panel-hidden');
      this.player().toggleClass('shoppable-panel-visible');
      let eventName = this.player().hasClass('shoppable-panel-visible') ? 'productBarMax' : 'productBarMin';
      this.player().trigger(eventName);
    });
    this.addChild(shoppablePanelToggle);

    this.addChild('ShoppablePanel', this.options_);

    this.dispose = () => {
      this.removeLayout();
      super.dispose();
    };
  }

  createEl() {
    const el = super.createEl('div');

    return el;
  }

}

videojs.registerComponent('shoppableBarLayout', ShoppableBarLayout);

export default ShoppableBarLayout;
