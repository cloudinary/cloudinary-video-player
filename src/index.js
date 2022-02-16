import 'assets/styles/main.scss';
import VideoPlayer from './video-player';
import { assign } from 'utils/assign';
export const cloudinaryVideoPlayerConfig = (config) => {

  const getMergedConfig = (options) => assign(options, { cloudinaryConfig: config });

  function videoPlayer(id, options = {}, ready = null) {
    return new VideoPlayer(id, getMergedConfig(options), ready);
  }

  function videoPlayers(selector, options = {}, ready = null) {
    return VideoPlayer.all(selector, getMergedConfig(options), ready);
  }

  return {
    videoPlayer,
    videoPlayers
  };
};

window.cloudinary = {
  ...(window.cloudinary || {}),
  Cloudinary: {
    new: cloudinaryVideoPlayerConfig
  }
};

