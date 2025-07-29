import 'videojs-per-source-behaviors';

import aiHighlightsGraph from './ai-highlights-graph';
import analytics from './analytics';
import autoplayOnScroll from './autoplay-on-scroll';
import cloudinary from './cloudinary';
import cloudinaryAnalytics from './cloudinary-analytics';
import contextMenu from './context-menu';
import floatingPlayer from './floating-player';
import pacedTranscript from './paced-transcript';
import styledTextTracks from './styled-text-tracks';
import vttThumbnails from './vtt-thumbnails';
import dynamicTextTracksPlugin from './dynamic-text-tracks';

// Lazy loaded plugins
import chapters from './chapters';
import colors from './colors';
import imaPlugin from './ima';
import interactionAreas from './interaction-areas';
import playlist from './playlist';
import shoppable from './shoppable-plugin';
import srtTextTracks from './srt-text-tracks';
import visualSearch from './visual-search';
import adaptiveStreaming from './adaptive-streaming';

const plugins = {
  aiHighlightsGraph,
  analytics,
  autoplayOnScroll,
  cloudinary,
  cloudinaryAnalytics,
  contextMenu,
  floatingPlayer,
  pacedTranscript,
  styledTextTracks,
  vttThumbnails,
  dynamicTextTracks: dynamicTextTracksPlugin,

  // Lazy loaded plugins
  chapters,
  colors,
  imaPlugin,
  playlist,
  shoppable,
  srtTextTracks,
  interactionAreas,
  visualSearch,
  adaptiveStreaming
};

export default plugins;
