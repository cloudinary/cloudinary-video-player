import '~/assets/styles/main.scss';
import { createAsyncPlayer, createMultiplePlayers, createMultipleSync, setupCloudinaryGlobal } from './utils/player-api';
import { createDeferredPlayer } from './utils/deferred-player';

const importCore = () => import(/* webpackChunkName: "cld-player-core" */ './video-player.js');
const mergeOpts = (...opts) => Object.assign({}, ...opts, {
  _internalAnalyticsMetadata: Object.assign(
    {},
    ...opts.map((opt) => opt?._internalAnalyticsMetadata || {}),
    { playerBundle: 'lazy' }
  )
});

export const videoPlayer = (id, playerOptions = {}, ready) =>
  createDeferredPlayer(
    importCore().then((m) => m.createVideoPlayer(id, mergeOpts(playerOptions), ready))
  );

export const videoPlayers = (selector, playerOptions, ready) =>
  createMultipleSync(selector, playerOptions, ready, videoPlayer);

export const player = (id, playerOptions = {}, ready) =>
  createAsyncPlayer(id, playerOptions, ready, async (videoElement, opts, r) => {
    const { createPlayerWithConfig } = await importCore();
    return createPlayerWithConfig(videoElement, mergeOpts(opts), r);
  });

export const players = (selector, playerOptions, ready) =>
  createMultiplePlayers(selector, playerOptions, ready, player);

const cloudinaryVideoPlayerLegacyConfig = (instanceConfig = {}) => {
  console.warn(
    'Cloudinary.new() is deprecated and will be removed. Please use cloudinary.videoPlayer() instead.'
  );
  return {
    videoPlayer: (id, playerOptions = {}, ready) =>
      createDeferredPlayer(
        importCore().then((m) => m.createVideoPlayer(id, mergeOpts(instanceConfig, playerOptions), ready))
      ),
    videoPlayers: (selector, playerOptions = {}, ready) =>
      createMultipleSync(selector, mergeOpts(instanceConfig, playerOptions), ready, videoPlayer)
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
