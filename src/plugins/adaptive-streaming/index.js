export default async function lazyAdaptiveStreamingPlugin(options) {
  const player = this;

  try {
    if (options.isDash) {
      await import(/* webpackChunkName: "dash" */ 'videojs-contrib-dash');
    }
    await import(/* webpackChunkName: "adaptive-streaming" */ './adaptive-streaming');
    const { default: abrPlugin } = await import(/* webpackChunkName: "adaptive-streaming" */ './adaptive-streaming');
    abrPlugin(player, options);
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
}
