import defaults from 'config/defaults';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';

const hasConfig = (obj) => isEmpty(obj) ? null : true;

const filterDefaultsAndNulls = (obj) => Object.entries(obj).reduce((filtered, [key, value]) => {
  if (value !== defaults[key] && value !== undefined && value !== null) {
    filtered[key] = value;
  }
  return filtered;
}, {});

const getCloudinaryOptions = (cloudinaryOptions = {}) => ({
  sourceTypes: cloudinaryOptions.sourceTypes,
  autoShowRecommendations: cloudinaryOptions.autoShowRecommendations,
  fontFace: cloudinaryOptions.fontFace,
  posterOptions: hasConfig(cloudinaryOptions.posterOptions),
  posterOptionsPublicId: cloudinaryOptions.posterOptions && hasConfig(cloudinaryOptions.posterOptions.publicId)
});

  };
const getSourceOptions = (sourceOptions = {}) => ({
  chapters: sourceOptions.chapters && (sourceOptions.chapters.url ? 'url' : 'inline-chapters'),
  recommendations: sourceOptions.recommendations && sourceOptions.recommendations.length,
  shoppable: hasConfig(sourceOptions.shoppable),
  shoppableProductsLength: sourceOptions.shoppable && sourceOptions.shoppable.products && sourceOptions.shoppable.products.length,
  ...(sourceOptions.info ? {
    sourceInfoTitle: sourceOptions.info.title,
    sourceInfoSubtitle: sourceOptions.info.subtitle,
    sourceInfoDescription: sourceOptions.info.description
  } : {}),
  ...(sourceOptions.textTracks ? {
    textTracks: hasConfig(sourceOptions.textTracks),
    pacedTextTracks: hasConfig(sourceOptions.textTracks) && JSON.stringify(sourceOptions.textTracks || {}).includes('"maxWords":'),
    wordHighlight: hasConfig(sourceOptions.textTracks) && JSON.stringify(sourceOptions.textTracks || {}).includes('"wordHighlight":'),
    ...(sourceOptions.textTracks.options ? {
      styledTextTracksTheme: sourceOptions.textTracks.options.theme,
      styledTextTracksFont: sourceOptions.textTracks.options.fontFace,
      styledTextTracksFontSize: sourceOptions.textTracks.options.fontSize,
      styledTextTracksGravity: sourceOptions.textTracks.options.gravity,
      styledTextTracksBox: hasConfig(sourceOptions.textTracks.options.box),
      styledTextTracksStyle: hasConfig(sourceOptions.textTracks.options.style),
      styledTextTracksWordHighlightStyle: hasConfig(sourceOptions.textTracks.options.wordHighlightStyle)
    } : {})
  } : {})
});

const getAdsOptions = (adsOptions = {}) => ({
  adsAdTagUrl: adsOptions.adTagUrl,
  adsShowCountdown: adsOptions.showCountdown,
  adsAdLabel: adsOptions.adLabel,
  adsLocale: adsOptions.locale,
  adsPrerollTimeout: adsOptions.prerollTimeout,
  adsPostrollTimeout: adsOptions.postrollTimeout,
  adsAdsInPlaylist: adsOptions.adsInPlaylist
});

const getPlaylistWidgetOptions = (playlistWidgetOptions = {}) => ({
  playlistWidgetDirection: playlistWidgetOptions.direction,
  playlistWidgetTotal: playlistWidgetOptions.total
});

export const getAnalyticsFromPlayerOptions = (playerOptions) => filterDefaultsAndNulls({
  aiHighlightsGraph: playerOptions.aiHighlightsGraph,
  analytics: hasConfig(playerOptions.analytics),
  autoplay: playerOptions.autoplay,
  autoplayMode: playerOptions.autoplayMode,
  bigPlayButton: playerOptions.bigPlayButton,
  className: playerOptions.class,
  cloudinaryAnalytics: !!playerOptions.cloudinaryAnalytics,
  cloudinaryAnalyticsOptions: isObject(playerOptions.cloudinaryAnalytics),
  controls: playerOptions.controls,
  floatingWhenNotVisible: playerOptions.floatingWhenNotVisible,
  fluid: playerOptions.fluid,
  height: playerOptions.height,
  hideContextMenu: playerOptions.hideContextMenu,
  logoImageUrl: playerOptions.logoImageUrl,
  logoOnclickUrl: playerOptions.logoOnclickUrl,
  loop: playerOptions.loop,
  maxTries: playerOptions.maxTries,
  muted: playerOptions.muted,
  playbackRates: playerOptions.playbackRates,
  playedEventPercents: playerOptions.playedEventPercents,
  playedEventTimes: playerOptions.playedEventTimes,
  playsinline: playerOptions.playsinline,
  preload: playerOptions.preload,
  videoTimeout: playerOptions.videoTimeout,
  seekThumbnails: playerOptions.seekThumbnails,
  showJumpControls: playerOptions.showJumpControls,
  chaptersButton: playerOptions.chaptersButton,
  pictureInPictureToggle: playerOptions.pictureInPictureToggle,
  showLogo: playerOptions.showLogo,
  skin: playerOptions.skin,
  videoJS: hasConfig(playerOptions.videoJS),
  width: playerOptions.width,
  withCredentials: playerOptions.withCredentials,
  debug: playerOptions.debug,

  colors: playerOptions.colors && JSON.stringify(playerOptions.colors),
  controlBar: (JSON.stringify(playerOptions.controlBar) !== JSON.stringify(defaults.controlBar)) && JSON.stringify(playerOptions.controlBar),

  ...getCloudinaryOptions(playerOptions.cloudinary),
  ...getSourceOptions(playerOptions.source),
  ...getAdsOptions(playerOptions.ads),
  ...getPlaylistWidgetOptions(playerOptions.playlistWidget)
});
