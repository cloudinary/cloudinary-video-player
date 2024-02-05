import 'videojs-per-source-behaviors';

// #if (!process.env.WEBPACK_BUILD_LIGHT)
import dashPlugin from './dash';
import imaPlugin from './ima';
import './videojs-http-source-selector/plugin';
// #endif

import aiHighlightsGraph from './ai-highlights-graph';
import analytics from './analytics';
import autoplayOnScroll from './autoplay-on-scroll';
import cloudinary from './cloudinary';
import cloudinaryAnalytics from './cloudinary-analytics';
import colors from './colors';
import contextMenu from './context-menu';
import floatingPlayer from './floating-player';
import pacedTranscript from './paced-transcript';
import vttThumbnails from './vtt-thumbnails';

// Lazy loaded plugins
import chapters from './chapters';
import playlist from './playlist';
import shoppable from './shoppable-plugin';
import styledTextTracks from './styled-text-tracks';
import interactionAreas from './interaction-areas';

const plugins = {
  // #if (!process.env.WEBPACK_BUILD_LIGHT)
  dashPlugin,
  imaPlugin,
  // #endif

  aiHighlightsGraph,
  analytics,
  autoplayOnScroll,
  cloudinary,
  cloudinaryAnalytics,
  colors,
  contextMenu,
  floatingPlayer,
  pacedTranscript,
  vttThumbnails,

  // Lazy loaded plugins
  chapters,
  playlist,
  shoppable,
  styledTextTracks,
  interactionAreas
};

export default plugins;
