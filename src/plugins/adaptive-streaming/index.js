export default async function lazyAdaptiveStreamingPlugin(options) {
  const player = this;

  try {
    if (options.isDash && !window.dashjs) {
      await import(/* webpackChunkName: "dash" */ 'videojs-contrib-dash');
    }
    const { default: abrPlugin } = await import(/* webpackChunkName: "adaptive-streaming" */ './adaptive-streaming');
    abrPlugin(player, options);
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
}
