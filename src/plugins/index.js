import 'videojs-per-source-behaviors';

// #if (!process.env.WEBPACK_BUILD_LIGHT)
import dashPlugin from './dash';
import imaPlugin from './ima';
import interactive from './interactive-plugin';
import './videojs-http-source-selector/plugin';
// #endif

import autoplayOnScroll from './autoplay-on-scroll';
import floatingPlayer from './floating-player';
import colors from './colors';
import contextMenu from './context-menu';
import cloudinary from './cloudinary';
import analytics from './analytics';
import cloudinaryAnalytics from './cloudinary-analytics';
import vttThumbnails from './vtt-thumbnails';
import aiHighlightsGraph from './ai-highlights-graph';
import chapters from './chapters';
import pacedTranscript from './paced-transcript';

const plugins = {
  autoplayOnScroll,
  floatingPlayer,
  colors,
  contextMenu,
  cloudinary,
  analytics,
  cloudinaryAnalytics,
  vttThumbnails,
  aiHighlightsGraph,
  chapters,
  pacedTranscript,
  // #if (!process.env.WEBPACK_BUILD_LIGHT)
  interactive,
  dashPlugin,
  imaPlugin
  // #endif
};

export default plugins;
