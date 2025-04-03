export default async function lazyVisualSearchPlugin(options) {
  const player = this;
  try {
    const { default: initPlugin } = await import(/* webpackChunkName: "visual-search" */ './visual-search');
    player.ready(() => initPlugin(options, player));
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
}
