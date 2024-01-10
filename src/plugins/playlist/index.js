export default async function lazyPlugin(options) {
  const player = this;
  try {
    const { default: playlistPlugin } = await import(/* webpackChunkName: "playlist" */ './playlist');
    const playlist = playlistPlugin(player, options);
    player.cloudinary.playlist = playlist;
    return playlist;
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
}
