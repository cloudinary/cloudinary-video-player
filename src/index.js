import '~/assets/styles/main.scss';
import videojs from 'video.js';
import { createVideoPlayer, createPlayerWithConfig } from './video-player.js';
import { createAsyncPlayer, createMultiplePlayers, createMultipleSync } from './utils/player-api';

export { videojs };

export const videoPlayer = (id, playerOptions = {}, ready) =>
  createVideoPlayer(id, playerOptions, ready);

export const videoPlayers = (selector, playerOptions, ready) =>
  createMultipleSync(selector, playerOptions, ready, videoPlayer);

export const player = (id, playerOptions = {}, ready) =>
  createAsyncPlayer(id, playerOptions, ready, createPlayerWithConfig);

export const players = (selector, playerOptions, ready) =>
  createMultiplePlayers(selector, playerOptions, ready, player);

export default { videoPlayer, videoPlayers, player, players };
