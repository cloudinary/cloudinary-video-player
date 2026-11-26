import type { AdOptions, PlayerOptions, PlaylistWidgetOptions } from './types.js';

/**
 * Default option values: the v4 run-time defaults (`src/config/defaults.js` on `master`).
 * Object values merge one level deep with the given value. `fontFace` changes to Inter (FR-041).
 * A unit test keeps these values equal to the `@default` tags in `types.ts`.
 */
export const DEFAULTS: Readonly<PlayerOptions> = {
  type: 'upload',
  resourceType: 'video',
  sourceTypes: ['auto'],
  breakpoints: false,
  maxDpr: 2,
  hdr: false,
  download: false,
  autoShowRecommendations: false,
  withCredentials: false,
  adaptiveStreaming: { strategy: 'balanced' },
  allowUsageReport: true,
  secure: true,
  autoplay: false,
  muted: false,
  loop: false,
  controls: false,
  preload: 'metadata',
  fluid: false,
  bigPlayButton: true,
  skin: 'dark',
  colors: { base: '#000000', accent: '#FF620C', text: '#FFFFFF' },
  fontFace: 'Inter',
  showLogo: true,
  logoOnclickUrl: 'https://cloudinary.com/',
  showJumpControls: false,
  pictureInPictureToggle: false,
  chaptersButton: false,
  seekThumbnails: true,
  aiHighlightsGraph: false,
  hideContextMenu: false,
  floatingWhenNotVisible: 'none',
  analytics: false,
  cloudinaryAnalytics: true,
  playedEventPercents: [25, 50, 75, 100],
  videoConfig: true,
  lazy: false,
  debug: false,
  maxTries: 3,
  videoTimeout: 55000,
  fetchErrorUsingGet: false,
};

/** Volume preset when `muted` is set, so that unmuting is not at full volume (v4). */
export const MUTED_VOLUME = 0.4;

/** Defaults of `ads`, applied by the ads feature only when `ads` is set. */
export const AD_DEFAULTS: Readonly<AdOptions> = {
  adTagUrl: '',
  showCountdown: true,
  adLabel: 'Advertisement',
  locale: 'en',
  prerollTimeout: 5000,
  postrollTimeout: 5000,
  adsInPlaylist: 'first-video',
};

/** Defaults of `playlistWidget`, applied by the playlist feature. */
export const PLAYLIST_WIDGET_DEFAULTS: Readonly<PlaylistWidgetOptions> = {
  direction: 'horizontal',
  total: 0,
};
