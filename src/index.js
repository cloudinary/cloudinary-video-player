import 'assets/styles/main.scss';
import VideoPlayer from './video-player';
import createVideoPlayerProfile from './video-player-profile';
import { assign } from 'utils/assign';
import { pick, convertKeysToSnakeCase } from './utils/object';
import { CLOUDINARY_CONFIG_PARAM } from './video-player.const';

const getConfig = (playerOptions = {}, cloudinaryConfig) => {
  const snakeCaseCloudinaryConfig = pick(convertKeysToSnakeCase(playerOptions), CLOUDINARY_CONFIG_PARAM);

  // pick cld-configurations and assign them to cloudinaryConfig
  return assign(playerOptions, {
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

const cloudinary = {
  ...(window.cloudinary || {}),
  videoPlayer,
  videoPlayers,
  videoPlayerWithProfile
};

window.cloudinary = cloudinary;

export default cloudinary;
