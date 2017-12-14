// #if (!process.env.WEBPACK_BUILD_LIGHT)
import 'videojs-contrib-ads';
import './ima';
import 'videojs-contrib-hls';
// #endif
import 'videojs-per-source-behaviors';
import autoplayOnScroll from './autoplay-on-scroll';
import contextMenu from './context-menu';
import cloudinary from './cloudinary';
import analytics from './analytics';

export { autoplayOnScroll, contextMenu, cloudinary, analytics };
