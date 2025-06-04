export default async function lazyColorsPlugin(options) {
  const player = this;
  try {
    const { default: colorsPlugin } = await import(/* webpackChunkName: "colors" */ './colors');
    const colors = colorsPlugin(player, options);
    player.cloudinary.colors = colors;
    return colors;
  } catch (error) {
    console.error('Failed to load colors plugin:', error);
  }
}
