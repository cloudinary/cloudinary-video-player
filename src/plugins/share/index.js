export default async function lazySharePlugin(options) {
  const player = this;
  try {
    const { default: initPlugin } = await import(/* webpackChunkName: "share-plugin" */ './share');
    player.ready(() => initPlugin(options, player));
  } catch (error) {
    console.error('Failed to load share plugin:', error);
  }
}
