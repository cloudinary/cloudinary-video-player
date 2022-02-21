import 'assets/styles/main.scss';
import VideoPlayer from './video-player';
import { assign } from 'utils/assign';

if (window.cloudinary && window.cloudinary.Cloudinary) {
  console.warn('For version 2.0.0 and above, cloudinary-core is not needed for using the Cloudinary Video Player');
}

const getConfig = (playerOptions = {}, cloudinaryConfig) => assign(playerOptions, { cloudinaryConfig: cloudinaryConfig || playerOptions });

const getVideoPlayer = (config) => (id, playerOptions, ready) => new VideoPlayer(id, getConfig(playerOptions, config), ready);

const getVideoPlayers = (config) => (selector, playerOptions, ready) => VideoPlayer.all(selector, getConfig(playerOptions, config), ready);

const cloudinaryVideoPlayerConfig = (config) => ({
  videoPlayer: getVideoPlayer(config),
  videoPlayers: getVideoPlayers(config)
});

export const videoPlayer = getVideoPlayer();
export const videoPlayers = getVideoPlayers();

window.cloudinary = {
  ...(window.cloudinary || {}),
  videoPlayer,
  videoPlayers,
  Cloudinary: {
    new: cloudinaryVideoPlayerConfig
  }
};

