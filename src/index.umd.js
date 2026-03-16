/**
 * UMD entry: full player bundle for backwards-compatible sync videoPlayer().
 * player() is async with profile and schedule support.
 */
import '~/assets/styles/main.scss';
import { createVideoPlayer, createPlayerWithConfig } from './video-player';
import { scheduleBootstrap, shouldUseScheduleBootstrap, getElementForSchedule } from './utils/schedule';

export const videoPlayer = (id, playerOptions = {}, ready) => {
  return createVideoPlayer(id, playerOptions, ready);
};

export const videoPlayers = (selector, playerOptions, ready) => {
  const nodeList = document.querySelectorAll(selector);
  return [...nodeList].map((node) => videoPlayer(node, playerOptions, ready));
};

export const player = async (id, playerOptions = {}, ready) => {
  const mergedOptions = Object.assign({}, playerOptions);
  const videoElement = getElementForSchedule(id);

  const opts = await (async () => {
    try {
      const { fetchAndMergeConfig } = await import('./utils/fetch-config');
      const fetched = await fetchAndMergeConfig(mergedOptions);
      return Object.assign({}, fetched, mergedOptions);
    } catch {
      return mergedOptions;
    }
  })();

  if (shouldUseScheduleBootstrap(opts)) {
    return scheduleBootstrap(id, opts);
  }

  return createPlayerWithConfig(videoElement, opts, ready);
};

export const players = async (selector, playerOptions, ready) => {
  const nodeList = document.querySelectorAll(selector);
  return Promise.all([...nodeList].map((node) => player(node, playerOptions, ready)));
};

const cloudinaryVideoPlayerLegacyConfig = () => {
  console.warn(
    'Cloudinary.new() is deprecated and will be removed. Please use cloudinary.videoPlayer() instead.'
  );
  return {
    videoPlayer,
    videoPlayers
  };
};

const cloudinary = {
  ...(window.cloudinary || {}),
  videoPlayer,
  videoPlayers,
  player,
  players,
  Cloudinary: {
    new: cloudinaryVideoPlayerLegacyConfig
  }
};

window.cloudinary = cloudinary;

export default cloudinary;
