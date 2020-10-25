// #if (!process.env.WEBPACK_BUILD_LIGHT)
import 'videojs-contrib-ads';
import './ima';
import dashPlugin from './dash';
import interactive from './interactive-plugin';
import './videojs-http-source-selector/plugin';
// #endif

import autoplayOnScroll from './autoplay-on-scroll';
import floatingPlayer from './floating-player';
import colors from './colors';
import contextMenu from './context-menu';
import cloudinary from './cloudinary';
import analytics from './analytics';
import vttThumbnails from './vtt-thumbnails';

const plugins = {
  autoplayOnScroll,
  floatingPlayer,
  colors,
  contextMenu,
  cloudinary,
  analytics,
  vttThumbnails,
  // #if (!process.env.WEBPACK_BUILD_LIGHT)
  interactive,
  dashPlugin
  // #endif
};

export default plugins;
