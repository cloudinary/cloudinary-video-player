import 'assets/styles/main.scss';
import VideoPlayer from './video-player';
import { assign } from 'utils/assign';


function videoPlayer(id, playerOptions, ready = null) {
  return new VideoPlayer(id, playerOptions, ready);
}

function videoPlayers(selector, playerOptions, ready = null) {
  return VideoPlayer.all(selector, playerOptions, ready);
}

const getConfig = (playerOptions = {}, cloudinaryConfig) => {
  return assign(playerOptions, { cloudinaryConfig: cloudinaryConfig || playerOptions });
};

const cloudinaryVideoPlayerConfig = (config) => ({
  videoPlayer: (id, playerOptions, ready) => videoPlayer(id, getConfig(playerOptions, config), ready),
  videoPlayers: (selector, playerOptions, ready) => videoPlayers(selector, getConfig(playerOptions, config), ready)
});

window.cloudinary = {
  ...(window.cloudinary || {}),
  videoPlayer: (id, playerOptions, ready) => videoPlayer(id, getConfig(playerOptions), ready),
  videoPlayers: (selector, playerOptions, ready) => videoPlayers(selector, getConfig(playerOptions), ready),
  Cloudinary: {
    new: cloudinaryVideoPlayerConfig
  }
};

