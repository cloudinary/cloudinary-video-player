import { scheduleBootstrap, shouldUseScheduleBootstrap, getElementForSchedule } from './utils/schedule';

export const videoPlayer = (id, playerOptions = {}, ready) => {
  if (shouldUseScheduleBootstrap(playerOptions)) {
    return scheduleBootstrap(id, playerOptions);
  }

  return import(/* webpackChunkName: "cld-video-player-core" */ './video-player.js').then(
    ({ createVideoPlayer }) => createVideoPlayer(id, playerOptions, ready)
  );
};

export const videoPlayers = (selector, playerOptions, ready) => {
  const nodeList = document.querySelectorAll(selector);
  return [...nodeList].map((node) => videoPlayer(node, playerOptions, ready));
};

export const player = async (id, playerOptions, ready) => {
  const { fetchAndMergeConfig } = await import(/* webpackChunkName: "cld-video-player-core" */ './utils/fetch-config');
  const mergedOptions = Object.assign({}, playerOptions);
  const videoElement = getElementForSchedule(id);

  const opts = await (async () => {
    try {
      const fetched = await fetchAndMergeConfig(mergedOptions);
      return Object.assign({}, fetched, mergedOptions);
    } catch {
      return mergedOptions;
    }
  })();

  if (shouldUseScheduleBootstrap(opts)) {
    return scheduleBootstrap(id, opts);
  }

  const { createPlayerWithConfig } = await import(/* webpackChunkName: "cld-video-player-core" */ './video-player.js');
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
