export default async function lazyShoppablePlugin(player, options) {

  const { default: ShoppableWidget } = await import(/* webpackChunkName: "shoppable" */ '../../components/shoppable-bar/shoppable');
  new ShoppableWidget(player, options.shoppable).init();

}
