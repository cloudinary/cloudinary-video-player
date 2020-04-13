import videojs from 'video.js';
import ShoppableWidget from '../../components/shoppable-bar/shoppable-widget';

const Plugin = videojs.getPlugin('plugin');


class CldInteractivePlugin extends Plugin {

  constructor(player, options) {
    super(player, options);
    if (options.shoppable) {
      // eslint-disable-next-line no-new
      new ShoppableWidget(player, options.shoppable);
    }
  }
}
videojs.registerPlugin('cldInteractivePlugin', CldInteractivePlugin);

