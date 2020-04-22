import ShoppableWidget from '../../components/shoppable-bar/shoppable-widget';

export default function interactivePlugin(player, options) {

  // Shoppable Video
  if (options.shoppable) {
    new ShoppableWidget(player, options.shoppable).init();
  }

}
