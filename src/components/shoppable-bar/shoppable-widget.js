import videojs from 'video.js';
import ShoppableBarLayout from './layout/bar-layout';
import './shoppable-widget.scss';

const OPTIONS_DEFAULTS = {
  show: true,
  direction: 'vertical',
  total: 4,
  selector: false,
  renderTo: []
};

const modifyOptions = (player, opt) => {
  const options = { ...OPTIONS_DEFAULTS, ...opt };

  if (options.show && typeof options.selector === 'string') {
    options.useDefaultLayout = false;
    options.useCustomLayout = true;
    options.renderTo = document.querySelector(options.selector);
    options.showAll = true;

    if (!options.renderTo.length === 0) {
      throw new Error(`Couldn't find element(s) by selector '${options.selector}' for playlist`);
    }
  }

  if (options.show && !options.selector) {
    options.useDefaultLayout = true;
    options.useCustomLayout = false;
  }

  options.direction = options.direction.toLowerCase() === 'horizontal' ? 'horizontal' : 'vertical';

  return options;
};


class ShoppableWidget {
  constructor(player, options = {}) {
    options = modifyOptions(player, options);
    this.options_ = options;
    this.player_ = player;
    this.render();

    this.options = (options) => {
      if (!options) {
        return this.options_;
      }

      this.options_ = videojs.mergeOptions(this.options_, options);
      return this.options_;

    };

    this.dispose = () => {
      this.layout_.dispose();
    };
  }

  render() {
    this.layout_ = new ShoppableBarLayout(this.player_, this.options_);
  }

  getLayout() {
    return this.layout_;
  }

  update(optionName, optionValue) {
    this.options(optionValue);

    if (optionName === 'direction') {
      this.layout_.removeLayout();
      this.layout_.dispose();
      this.render();
    } else {
      this.layout_.update(optionName, this.options_);
    }
  }

  total(total = OPTIONS_DEFAULTS.total) {
    total = parseInt(total, 10);

    if (total !== this.options_.total && typeof total === 'number' && total > 0) {
      this.update('total', { total: total });
    }

    return this;
  }

  direction(direction = OPTIONS_DEFAULTS.direction) {
    if (direction === 'horizontal' || direction === 'vertical') {
      this.update('direction', { direction: direction });
    }

    return this;
  }
}


export default ShoppableWidget;
