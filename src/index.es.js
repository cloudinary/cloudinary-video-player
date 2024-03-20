// This file is bundled as `videoPlayer.js` to be imported as a tree-shaken module.
// It is the default export of the Cloudinary Video Player.

// Usage:
// import cloudinary from 'cloudinary-video-player';
// Or:
// import { videoPlayer } from "cloudinary-video-player";

// Other modules can be imported like that:
// import dash from 'cloudinary-video-player/dash';

import { videoPlayer as player } from './index.js';

export const videoPlayer = player;

const cloudinary = {
  videoPlayer: player
};

export default cloudinary;
