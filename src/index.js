import 'assets/styles/main.scss';
import videojs from 'video.js';
import VideoPlayer from './video-player';
import defaults from './config/defaults';
import { getResolveVideoElement, extractOptions } from './video-player.utils';
import { fetchAndMergeConfig } from './utils/fetch-config';

const getConfig = (elem, playerOptions = {}) => {
  const videoElement = getResolveVideoElement(elem);
  const options = extractOptions(videoElement, playerOptions);
  
  return { videoElement, options };
};

const mergeDefaults = (options) => videojs.obj.merge({}, defaults, options);

export const videoPlayer = (id, playerOptions = {}, ready) => {  
  const { videoElement, options } = getConfig(id, playerOptions);
  if (options.profile) {
    console.warn('Profile option requires async initialization. Use cloudinary.player() instead of cloudinary.videoPlayer()');
  }
  return new VideoPlayer(videoElement, mergeDefaults(options), ready);
};

export const videoPlayers = (selector, playerOptions, ready) => {
  const nodeList = document.querySelectorAll(selector);
  return [...nodeList].map(node => videoPlayer(node, playerOptions, ready));
};

export const player = async (id, playerOptions, ready) => {
  const { videoElement, options } = getConfig(id, playerOptions);
  
  try {
    const videoConfig = await fetchAndMergeConfig(options);
    return new VideoPlayer(videoElement, mergeDefaults(videoConfig), ready);
  } catch (e) {
    const videoPlayer = new VideoPlayer(videoElement, mergeDefaults(options));
    videoPlayer.videojs.error('Invalid profile');
    throw e;
  }
};

export const players = async (selector, playerOptions, ready) => {
  const nodeList = document.querySelectorAll(selector);
  return Promise.all([...nodeList].map(node => player(node, playerOptions, ready)));
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
