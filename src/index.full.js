/**
 * UMD entry: full player bundle for backwards-compatible sync videoPlayer().
 * player() is async with profile and schedule support.
 */
import '~/assets/styles/main.scss';
import { createVideoPlayer, createPlayerWithConfig } from './video-player';
import { createAsyncPlayer, createMultiplePlayers, createMultipleSync, setupCloudinaryGlobal } from './utils/player-api';

export const videoPlayer = (id, playerOptions = {}, ready) =>
  createVideoPlayer(id, playerOptions, ready);

export const videoPlayers = (selector, playerOptions, ready) =>
  createMultipleSync(selector, playerOptions, ready, videoPlayer);

export const player = (id, playerOptions = {}, ready) =>
  createAsyncPlayer(id, playerOptions, ready, createPlayerWithConfig);

export const players = (selector, playerOptions, ready) =>
  createMultiplePlayers(selector, playerOptions, ready, player);

const cloudinaryVideoPlayerLegacyConfig = (instanceConfig = {}) => {
  console.warn(
    'Cloudinary.new() is deprecated and will be removed. Please use cloudinary.videoPlayer() instead.'
  );
  const mergeOpts = (callOpts = {}) => Object.assign({}, instanceConfig, callOpts);
  return {
    videoPlayer: (id, playerOptions = {}, ready) =>
      createVideoPlayer(id, mergeOpts(playerOptions), ready),
    videoPlayers: (selector, playerOptions = {}, ready) =>
      createMultipleSync(selector, mergeOpts(playerOptions), ready, videoPlayer)
  };
};

export default setupCloudinaryGlobal({
  videoPlayer,
  videoPlayers,
  player,
  players,
  Cloudinary: {
    new: cloudinaryVideoPlayerLegacyConfig
  }
});
