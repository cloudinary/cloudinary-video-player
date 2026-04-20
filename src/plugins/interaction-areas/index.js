export default async function lazyInteractionAreasPlugin(player, playerOptions, videojsOptions) {
  try {
    const { interactionAreasService } = await import(/* webpackChunkName: "interaction-areas" */ './interaction-areas');
    interactionAreasService(player, playerOptions, videojsOptions);
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
}
