// #if (!process.env.WEBPACK_BUILD_LIGHT)
import 'videojs-contrib-ads';
import './ima';
import 'dashjs';
import 'videojs-contrib-dash';
import interactive from './interactive-plugin';
// #endif
import 'videojs-per-source-behaviors';
import autoplayOnScroll from './autoplay-on-scroll';
import floatingPlayer from './floating-player';
import colors from './colors';
import contextMenu from './context-menu';
import cloudinary from './cloudinary';
import analytics from './analytics';

export {
  autoplayOnScroll,
  floatingPlayer,
  colors,
  contextMenu,
  cloudinary,
  analytics,
  // #if (!process.env.WEBPACK_BUILD_LIGHT)
  interactive
  // #endif
};
