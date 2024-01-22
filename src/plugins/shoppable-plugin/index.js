export default async function lazyPlugin(player, options) {

  const { default: ShoppableWidget } = await import(/* webpackChunkName: "shoppable" */ '../../components/shoppable-bar/shoppable-widget');
  new ShoppableWidget(player, options.shoppable).init();

}
