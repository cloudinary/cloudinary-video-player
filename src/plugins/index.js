import 'videojs-per-source-behaviors';

import aiHighlightsGraph from './ai-highlights-graph';
import analytics from './analytics';
import autoplayOnScroll from './autoplay-on-scroll';
import cloudinary from './cloudinary';
import cloudinaryAnalytics from './cloudinary-analytics';
import colors from './colors';
import contextMenu from './context-menu';
import floatingPlayer from './floating-player';
import pacedTranscript from './paced-transcript';
import srtTextTracks from './srt-text-tracks';
import styledTextTracks from './styled-text-tracks';
import vttThumbnails from './vtt-thumbnails';

// Lazy loaded plugins
import chapters from './chapters';
import imaPlugin from './ima';
import interactionAreas from './interaction-areas';
import playlist from './playlist';
import shoppable from './shoppable-plugin';
import visualSearch from './visual-search';

const plugins = {
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
  imaPlugin,
  playlist,
  shoppable,
  srtTextTracks,
  styledTextTracks,
  interactionAreas,
  visualSearch
};

export default plugins;
