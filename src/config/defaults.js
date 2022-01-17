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
  controlBar: {
    'pictureInPictureToggle': false
  },
  preload: PRELOAD.AUTO,
  loop: false,
  muted: false,
  posterOptions: {},
  sourceTypes: ['webm/vp9', 'mp4/h265', 'mp4'],
  contextMenu: {
    content: contextMenuContent
  },
  floatingWhenNotVisible: FLOATING_TO.NONE,
  hideContextMenu: false,
  analytics: false,
  playedEventPercents: [25, 50, 75, 100]
};
