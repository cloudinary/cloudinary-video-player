import 'assets/styles/main.scss';
import pick from 'lodash/pick';
import VideoPlayer from './video-player';
import createPlayer from './player';
import { convertKeysToSnakeCase } from './utils/object';
import { CLOUDINARY_CONFIG_PARAM } from './video-player.const';

const getConfig = (playerOptions = {}, cloudinaryConfig) => {
  const snakeCaseCloudinaryConfig = pick(convertKeysToSnakeCase(playerOptions), CLOUDINARY_CONFIG_PARAM);

  // pick cld-configurations and assign them to cloudinaryConfig
  return Object.assign(playerOptions, {
    cloudinaryConfig: cloudinaryConfig || snakeCaseCloudinaryConfig
  });
};

const getVideoPlayer = config => (id, playerOptions, ready) => {
  const options = getConfig(playerOptions, config);
  if (options.profile) {
    return createPlayer(id, options, ready);
  }
  return new VideoPlayer(id, options, ready);
};

const getVideoPlayers = config => (selector, playerOptions, ready) =>
  VideoPlayer.all(selector, getConfig(playerOptions, config), ready);

const getPlayer = config => (id, playerOptions, ready) => createPlayer(id, getConfig(playerOptions, config), ready);

const getPlayers = config => (selector, playerOptions, ready) => {
  const nodeList = document.querySelectorAll(selector);
  const playerConfig = getConfig(playerOptions, config);
  return [...nodeList].map((node) => createPlayer(node, playerConfig, ready));
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
