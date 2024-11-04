// This file is bundled as `cld-video-player.js` to be imported as a tree-shaken module.
// It is the default export of the Cloudinary Video Player.

// Usage:
// import cloudinary from 'cloudinary-video-player';
// Or:
// import { videoPlayer } from "cloudinary-video-player";

// Other modules can be imported like that:
// import dash from 'cloudinary-video-player/dash';

import cloudinary from './index.js';

export const videoPlayer = cloudinary.videoPlayer;
export const videoPlayers = cloudinary.videoPlayers;

export const player = cloudinary.player;

export default cloudinary;
