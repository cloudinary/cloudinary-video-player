export default async function lazyPlugin(config) {
  const player = this;
  try {
    const { default: initPlugin } = await import('./styled-text-tracks');
    player.ready(() => initPlugin(config, player));
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
}