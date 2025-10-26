import 'assets/styles/main.scss';
import pick from 'lodash/pick';
import VideoPlayer from './video-player';
import createPlayer from './player';
import { convertKeysToSnakeCase } from './utils/object';
import { CLOUDINARY_CONFIG_PARAM } from './video-player.const';
import { getResolveVideoElement, extractOptions } from './video-player.utils';

const getConfig = (elem, playerOptions = {}, cloudinaryConfig) => {
  const snakeCaseCloudinaryConfig = pick(convertKeysToSnakeCase(playerOptions), CLOUDINARY_CONFIG_PARAM);
  const config = Object.assign(playerOptions, {
    cloudinaryConfig: cloudinaryConfig || snakeCaseCloudinaryConfig
  });
  
  const videoElement = getResolveVideoElement(elem);
  const options = extractOptions(videoElement, config);
  
  return { videoElement, options };
};

const getVideoPlayer = config => (id, playerOptions, ready) => {
  const { videoElement, options } = getConfig(id, playerOptions, config);
  if (options.profile) {
    return createPlayer(videoElement, options, ready);
  }
  return new VideoPlayer(videoElement, options, ready);
};

const getVideoPlayers = config => (selector, playerOptions, ready) => {
  const nodeList = document.querySelectorAll(selector);
  return [...nodeList].map((node) => {
    const { videoElement, options } = getConfig(node, playerOptions, config);
    return new VideoPlayer(videoElement, options, ready);
  });
};

const getPlayer = config => (id, playerOptions, ready) => {
  const { videoElement, options } = getConfig(id, playerOptions, config);
  return createPlayer(videoElement, options, ready);
};

const getPlayers = config => (selector, playerOptions, ready) => {
  const nodeList = document.querySelectorAll(selector);
  return [...nodeList].map((node) => {
    const { videoElement, options } = getConfig(node, playerOptions, config);
    return createPlayer(videoElement, options, ready);
  });
};

export const videoPlayer = getVideoPlayer();
export const videoPlayers = getVideoPlayers();

export const player = getPlayer();
export const players = getPlayers();

const cloudinaryVideoPlayerLegacyConfig = config => {
  console.warn(
    'Cloudinary.new() is deprecated and will be removed. Please use cloudinary.videoPlayer() instead.'
  );
  return {
    videoPlayer: getVideoPlayer(config),
    videoPlayers: getVideoPlayers(config)
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
