import 'videojs-per-source-behaviors';

import aiHighlightsGraph from './ai-highlights-graph';
import analytics from './analytics';
import autoplayOnScroll from './autoplay-on-scroll';
import cloudinary from './cloudinary';
import cloudinaryAnalytics from './cloudinary-analytics';
import contextMenu from './context-menu';
import floatingPlayer from './floating-player';
import mobileTouchControls from './mobile-touch-controls';
import sourceSwitcher from './source-switcher';
import styledTextTracks from './styled-text-tracks';
import vttThumbnails from './vtt-thumbnails';

// Lazy loaded plugins
import chapters from './chapters';
import colors from './colors';
import imaPlugin from './ima';
import interactionAreas from './interaction-areas';
import playlist from './playlist';
import shoppable from './shoppable-plugin';
import visualSearch from './visual-search';
import share from './share';
import adaptiveStreaming from './adaptive-streaming';
import textTracksManager from './text-tracks-manager';

const plugins = {
  aiHighlightsGraph,
  analytics,
  autoplayOnScroll,
  cloudinary,
  cloudinaryAnalytics,
  contextMenu,
  floatingPlayer,
  mobileTouchControls,
  sourceSwitcher,
  styledTextTracks,
  vttThumbnails,

  // Lazy loaded plugins
  chapters,
  colors,
  imaPlugin,
  playlist,
  shoppable,
  interactionAreas,
  visualSearch,
  share,
  adaptiveStreaming,
  textTracksManager,
};

export default plugins;
