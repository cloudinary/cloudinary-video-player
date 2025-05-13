// This file is bundled as `all.js` to be imported as a single module that includes all plugins.

// Usage:
// import { videoPlayer, videoPlayers } from 'cloudinary-video-player/all';
// Or:
// import cloudinary from 'cloudinary-video-player/all';

import cloudinary from './index.js';

export * from './index.js';
export * from './plugins/chapters/chapters.js';
export * from './plugins/ima/ima.js';
export * from './plugins/playlist/playlist.js';
export * from './plugins/interaction-areas/interaction-areas.service.js';
export * from './plugins/visual-search/visual-search.js';
export * from './components/shoppable-bar/shoppable-widget.js';

export default cloudinary;
