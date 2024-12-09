import srtTextTracks from './srt-text-tracks';

export default async function srtTextTracksPlugin(config) {
  const player = this;
  try {
    player.ready(() => srtTextTracks(config, player));
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
}
