import ShoppableWidget from '../../components/shoppable-bar/shoppable-widget';

export default function cldInteractivePlugin(player, options) {
  if (options) {
    // eslint-disable-next-line no-new
    new ShoppableWidget(player, options);
  }

}


