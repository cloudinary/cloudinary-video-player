/**
 * Lazy entry: tiny initial bundle, player core loads on demand.
 * Only player()/players() are available. For sync videoPlayer(), use the full bundle.
 */
import { scheduleBootstrap, shouldUseScheduleBootstrap, getElementForSchedule } from './utils/schedule';

export const player = async (id, playerOptions, ready) => {
  const mergedOptions = Object.assign({}, playerOptions);
  const videoElement = getElementForSchedule(id);

  const opts = await (async () => {
    try {
      const { fetchAndMergeConfig } = await import(
        /* webpackChunkName: "cld-player-config" */ './utils/fetch-config'
      );
      const fetched = await fetchAndMergeConfig(mergedOptions);
      return Object.assign({}, fetched, mergedOptions);
    } catch {
      return mergedOptions;
    }
  })();

  if (shouldUseScheduleBootstrap(opts)) {
    return scheduleBootstrap(id, opts);
  }

  const { videoPlayer } = await import(
    /* webpackChunkName: "cld-player-core" */ './index.js'
  );
  return videoPlayer(videoElement, opts, ready);
};

export const players = async (selector, playerOptions, ready) => {
  const nodeList = document.querySelectorAll(selector);
  return Promise.all([...nodeList].map((node) => player(node, playerOptions, ready)));
};

const cloudinary = {
  ...(window.cloudinary || {}),
  player,
  players,
};

window.cloudinary = cloudinary;

export default cloudinary;
