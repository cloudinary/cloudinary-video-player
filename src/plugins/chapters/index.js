export default async function lazyChaptersPlugin(options) {
  const player = this;
  try {
    const { default: initPlugin } = await import(/* webpackChunkName: "chapters" */ './chapters');
    player.ready(() => initPlugin(options, player));
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
}
