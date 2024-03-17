import styledTextTracks from './styled-text-tracks';

export default async function styledTextTracksPlugin(config) {
  const player = this;
  try {
    player.ready(() => styledTextTracks(config, player));
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
}
