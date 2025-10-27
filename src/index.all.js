// This file is bundled as `all.js` to be imported as a single module that includes all plugins.

// Usage:
// import { videoPlayer, videoPlayers } from 'cloudinary-video-player/all';
// Or:
// import cloudinary from 'cloudinary-video-player/all';

import cloudinary from './index.js';

// Import plugin implementations so webpack bundles them in /all.js
import './plugins/adaptive-streaming/adaptive-streaming.js';
import './plugins/chapters/chapters.js';
import './plugins/colors/colors.js';
import './plugins/ima/ima.js';
import './plugins/playlist/playlist.js';
import './plugins/interaction-areas/interaction-areas.service.js';
import './plugins/visual-search/visual-search.js';
import './plugins/share/share.js';
import './plugins/text-tracks-manager/text-tracks-manager.js';
import './components/shoppable-bar/shoppable-widget.js';
import './components/recommendations-overlay/recommendations-overlay.js';

export * from './index.js';
export default cloudinary;
