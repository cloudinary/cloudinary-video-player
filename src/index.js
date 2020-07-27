import 'assets/styles/main.scss';
import cloudinary from 'cloudinary-core';
import VideoPlayer from './video-player';
import { assign } from 'utils/assign';

cloudinary.VideoPlayer = VideoPlayer;

const proto = cloudinary.Cloudinary.prototype;

proto.videoPlayer = function(id, options = {}, ready = null) {
  assign(options, { cloudinaryConfig: this });
  return new VideoPlayer(id, options, ready);
};

proto.videoPlayers = function(selector, options = {}, ready = null) {
  assign(options, { cloudinaryConfig: this });
  return VideoPlayer.all(selector, options, ready);
};
