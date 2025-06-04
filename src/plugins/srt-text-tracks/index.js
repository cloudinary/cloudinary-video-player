export default async function lazySrtTextTracksPlugin(config) {
  const player = this;
  try {
    const { default: srtTextTracks } = await import(/* webpackChunkName: "srt-text-tracks" */ './srt-text-tracks');
    player.ready(() => srtTextTracks(config, player));
  } catch (error) {
    console.error('Failed to load srt-text-tracks plugin:', error);
  }
}
