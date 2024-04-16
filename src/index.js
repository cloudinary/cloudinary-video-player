import 'assets/styles/main.scss';
import pick from 'lodash/pick';
import VideoPlayer from './video-player';
import createVideoPlayerProfile from './video-player-profile';
import { convertKeysToSnakeCase } from './utils/object';
import { CLOUDINARY_CONFIG_PARAM } from './video-player.const';

const getConfig = (playerOptions = {}, cloudinaryConfig) => {
  const snakeCaseCloudinaryConfig = pick(convertKeysToSnakeCase(playerOptions), CLOUDINARY_CONFIG_PARAM);

  // pick cld-configurations and assign them to cloudinaryConfig
  return Object.assign(playerOptions, {
    cloudinaryConfig: cloudinaryConfig || snakeCaseCloudinaryConfig
  });
};

const getVideoPlayer = config => (id, playerOptions, ready) =>
  new VideoPlayer(id, getConfig(playerOptions, config), ready);

const getVideoPlayers = config => (selector, playerOptions, ready) =>
  VideoPlayer.all(selector, getConfig(playerOptions, config), ready);

const getVideoPlayerWithProfile = config => (id, playerOptions, ready) => createVideoPlayerProfile(id, getConfig(playerOptions, config), ready);

export const videoPlayer = getVideoPlayer();
export const videoPlayers = getVideoPlayers();
export const videoPlayerWithProfile = getVideoPlayerWithProfile();

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
  videoPlayerWithProfile,
  Cloudinary: {
    // Backwards compatibility with SDK v1
    new: cloudinaryVideoPlayerLegacyConfig
  }
};

window.cloudinary = cloudinary;

export default cloudinary;
