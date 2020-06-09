import contextMenuContent from '../plugins/context-menu/contextMenuContent';

export default {
  logoOnclickUrl: 'https://cloudinary.com/',
  showLogo: true,
  showJumpControls: false,
  skin: 'dark',
  controls: false,
  controlBar: {
    'pictureInPictureToggle': false
  },
  preload: false,
  loop: false,
  muted: false,
  posterOptions: {},
  sourceTypes: ['webm/vp9', 'mp4/h265', 'mp4'],
  contextMenu: {
    content: contextMenuContent
  },
  floatingWhenNotVisible: false,
  hideContextMenu: false,
  analytics: false,
  playedEventPercents: [25, 50, 75, 100]
};
