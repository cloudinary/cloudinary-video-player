export default async function lazyTextTracksManagerPlugin() {
  const player = this;
  try {
    const { default: textTracksManager } = await import(
      /* webpackChunkName: "text-tracks" */ './text-tracks-manager'
    );
    return textTracksManager.call(player);
  } catch (error) {
    console.error('Failed to load text tracks manager plugin:', error);
  }
}
