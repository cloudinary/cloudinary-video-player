import 'assets/styles/main.scss';
import pick from 'lodash/pick';
import VideoPlayer from './video-player';
import createPlayer from './video-player-profile';
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
  console.warn(
    'cloudinary.videoPlayer is deprecated and will be removed. Please use cloudinary.player() instead.'
  );
  return new VideoPlayer(id, getConfig(playerOptions, config), ready);
};

const getVideoPlayers = config => (selector, playerOptions, ready) => {
  console.warn(
    'cloudinary.videoPlayers is deprecated and will be removed. Please use cloudinary.player() instead.'
  );
  return VideoPlayer.all(selector, getConfig(playerOptions, config), ready);
};

const getPlayer = config => (id, playerOptions, ready) => createPlayer(id, getConfig(playerOptions, config), ready);

export const videoPlayer = getVideoPlayer();
export const videoPlayers = getVideoPlayers();
export const player = getPlayer();

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
  Cloudinary: {
    // Backwards compatibility with SDK v1
    new: cloudinaryVideoPlayerLegacyConfig
  }
};

window.cloudinary = cloudinary;

export default cloudinary;
