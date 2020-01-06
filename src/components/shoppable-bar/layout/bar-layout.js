import videojs from 'video.js';

const dom = videojs.dom || videojs;
const Component = videojs.getComponent('Component');
import ShoppablePanelToggle from './shoppable-panel-toggle';

class ShoppableBarLayout extends Component {
  constructor(player, options) {
    const layoutOptions = { ...options };
    super(player, layoutOptions);
    this.player_ = player;

    this.contentWrpEl_ = dom.createEl('div', { className: 'cld-spbl-bar' });
    this.contentEl_ = dom.createEl('div', { className: 'cld-spbl-bar-inner' });

    this.contentWrpEl_.appendChild(this.contentEl_);
    this.player().el().appendChild(this.contentWrpEl_);

    const shoppablePanelToggle = new ShoppablePanelToggle(this.player(), {});
    shoppablePanelToggle.on('click', e => {
      this.player().toggleClass('shoppable-panel-visible');
    });
    this.addChild(shoppablePanelToggle);

    this.addChild('ShoppablePanel', this.options_);

    this.dispose = () => {
      this.removeLayout();
      super.dispose();
    };
  }

  update(optionToChange, options) {
    this.options(options);
    this.removeChild('ShoppablePanel');
    this.addChild('ShoppablePanel', this.options_);
    this.trigger('shoppablebarlayoutupdate');
  }

  createEl() {
    const el = super.createEl('div');

    return el;
  }

}

videojs.registerComponent('shoppableBarLayout', ShoppableBarLayout);

export default ShoppableBarLayout;
