import videojs from 'video.js';
import contextMenuContent from '../plugins/context-menu/contextMenuContent';
import { FLOATING_TO, PRELOAD } from '../video-player.const';

export default {
  logoOnclickUrl: 'https://cloudinary.com/',
  showLogo: true,
  showJumpControls: false,
  playsinline: videojs.browser.IS_IOS,
  skin: 'dark',
  controls: false,
  chaptersButton: false,
  pictureInPictureToggle: false,
  seekThumbnails: true,
  aiHighlightsGraph: false,
  visualSearch: false,
  preload: PRELOAD.AUTO,
  textTrackSettings: false,
  loop: false,
  muted: false,
  posterOptions: {},
  sourceTypes: ['auto'],
  contextMenu: {
    content: contextMenuContent
  },
  floatingWhenNotVisible: FLOATING_TO.NONE,
  hideContextMenu: false,
  analytics: false,
  cloudinaryAnalytics: true,
  allowUsageReport: true,
  playedEventPercents: [25, 50, 75, 100],
  abr: {
    strategy: 'default',
  },
  html5: {
    handlePartialData: false,
    nativeTextTracks: false
  },
  disableSeekWhileScrubbingOnMobile: true
};
