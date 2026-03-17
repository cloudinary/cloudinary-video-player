/**
 * Lazy entry: tiny initial bundle, player core loads on demand.
 * Only player()/players() are available. For sync videoPlayer(), use the full bundle.
 */
import { createAsyncPlayer, createMultiplePlayers, setupCloudinaryGlobal } from './utils/player-api';

export const player = (id, playerOptions, ready) =>
  createAsyncPlayer(id, playerOptions, ready, async (videoElement, opts, r) => {
    const { videoPlayer } = await import(
      /* webpackChunkName: "cld-player-core" */ './index.js'
    );
    return videoPlayer(videoElement, opts, r);
  });

export const players = (selector, playerOptions, ready) =>
  createMultiplePlayers(selector, playerOptions, ready, player);

export default setupCloudinaryGlobal({ player, players });
