export default async function lazyInteractionAreasPlugin(player, playerOptions, videojsOptions) {
  try {
    const { interactionAreasService } = await import(/* webpackChunkName: "interaction-area" */ './interaction-areas.service');
    interactionAreasService(player, playerOptions, videojsOptions);
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
}
