import 'assets/styles/main.scss';
import VideoPlayer from './video-player';
import { assign } from 'utils/assign';


function videoPlayer(id, playerOptions, ready = null, cloudinaryConfig) {
  return new VideoPlayer(id, getConfig(cloudinaryConfig, playerOptions), ready);
}

function videoPlayers(selector, playerOptions, ready = null, cldConfig) {
  return VideoPlayer.all(selector, getConfig(cldConfig, playerOptions), ready);
}

const getConfig = (cloudinaryConfig, playerOptions = {}) => {
  return assign(playerOptions, { cloudinaryConfig: cloudinaryConfig || playerOptions });
};

const cloudinaryVideoPlayerConfig = (config) => ({
  videoPlayer: (id, playerOptions, ready) => videoPlayer(id, playerOptions, ready, config),
  videoPlayers: (selector, playerOptions, ready) => videoPlayers(selector, playerOptions, ready, config)
});

window.cloudinary = {
  ...(window.cloudinary || {}),
  videoPlayer,
  videoPlayers,
  Cloudinary: {
    new: cloudinaryVideoPlayerConfig
  }
};

