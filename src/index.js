import 'assets/styles/main.scss';
import VideoPlayer from './video-player';
import createPlayer from './player';
import { getResolveVideoElement, extractOptions } from './video-player.utils';

const getConfig = (elem, playerOptions = {}) => {
  const videoElement = getResolveVideoElement(elem);
  const options = extractOptions(videoElement, playerOptions);
  
  return { videoElement, options };
};

export const videoPlayer = (id, playerOptions, ready) => {
  const { videoElement, options } = getConfig(id, playerOptions);
  if (options.profile) {
    return createPlayer(videoElement, options, ready);
  }
  return new VideoPlayer(videoElement, options, ready);
};

export const videoPlayers = (selector, playerOptions, ready) => {
  const nodeList = document.querySelectorAll(selector);
  return [...nodeList].map((node) => {
    const { videoElement, options } = getConfig(node, playerOptions);
    return new VideoPlayer(videoElement, options, ready);
  });
};

export const player = (id, playerOptions, ready) => {
  const { videoElement, options } = getConfig(id, playerOptions);
  return createPlayer(videoElement, options, ready);
};

export const players = (selector, playerOptions, ready) => {
  const nodeList = document.querySelectorAll(selector);
  return [...nodeList].map((node) => {
    const { videoElement, options } = getConfig(node, playerOptions);
    return createPlayer(videoElement, options, ready);
  });
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
    // Backwards compatibility with SDK v1
    new: cloudinaryVideoPlayerLegacyConfig
  }
};

window.cloudinary = cloudinary;

export default cloudinary;
