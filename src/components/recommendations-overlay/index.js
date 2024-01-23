export default async function lazyRecommendationsOverlayComponent(player) {
  try {
    if (!player.getChild('recommendationsOverlay')) {
      await import(/* webpackChunkName: "recommendations-overlay" */ './recommendations-overlay');
      player.addChild('recommendationsOverlay');
    }
    return player;
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
}
