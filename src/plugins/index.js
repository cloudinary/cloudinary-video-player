import 'videojs-per-source-behaviors';

// #if (!process.env.WEBPACK_BUILD_LIGHT)
import './videojs-http-source-selector/plugin';
// #endif

import aiHighlightsGraph from './ai-highlights-graph';
import analytics from './analytics';
import autoplayOnScroll from './autoplay-on-scroll';
import chapters from './chapters';
import cloudinary from './cloudinary';
import cloudinaryAnalytics from './cloudinary-analytics';
import colors from './colors';
import contextMenu from './context-menu';
import floatingPlayer from './floating-player';
import pacedTranscript from './paced-transcript';
import vttThumbnails from './vtt-thumbnails';

// Lazy loaded plugins
import dashPlugin from './dash';
import imaPlugin from './ima';
import playlist from './playlist';
import shoppable from './shoppable-plugin';
import styledTextTracks from './styled-text-tracks';
import interactionAreas from './interaction-areas';

const plugins = {
  aiHighlightsGraph,
  analytics,
  autoplayOnScroll,
  chapters,
  cloudinary,
  cloudinaryAnalytics,
  colors,
  contextMenu,
  floatingPlayer,
  pacedTranscript,
  vttThumbnails,

  // Lazy loaded plugins
  dashPlugin,
  imaPlugin,
  playlist,
  shoppable,
  styledTextTracks,
  interactionAreas
};

export default plugins;
