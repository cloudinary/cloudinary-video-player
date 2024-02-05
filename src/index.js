import 'assets/styles/main.scss';
import VideoPlayer from './video-player';
import VideoPlayerProfile from './video-player-profile';
import { assign } from 'utils/assign';
import { pick, convertKeysToSnakeCase } from './utils/object';
import { CLOUDINARY_CONFIG_PARAM } from './video-player.const';

if (window.cloudinary && window.cloudinary.Cloudinary) {
  console.warn(
    'For version 1.9.0 and above, cloudinary-core is not needed for using the Cloudinary Video Player'
  );
}

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

const cloudinaryVideoPlayerConfig = config => ({
  videoPlayer: getVideoPlayer(config),
  videoPlayers: getVideoPlayers(config)
});

export const videoPlayer = getVideoPlayer();
export const videoPlayers = getVideoPlayers();

const getVideoPlayerProfile = config => (id, playerOptions, ready) =>
  new VideoPlayerProfile(id, getConfig(playerOptions, config), ready);

export const videoPlayerProfile = getVideoPlayerProfile();

const cloudinary = {
  ...(window.cloudinary || {}),
  videoPlayer,
  videoPlayers,
  videoPlayerProfile,
  Cloudinary: {
    // Backwards compatibility with SDK v1
    new: cloudinaryVideoPlayerConfig
  }
};

window.cloudinary = cloudinary;

export default cloudinary;
