import defaults from 'config/defaults';
import isEmpty from 'lodash/isEmpty';

const stringify = (obj) => new URLSearchParams(obj).toString();

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
  textTracks: hasConfig(sourceOptions.textTracks)
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
  analytics: playerOptions.analytics,
  autoplay: playerOptions.autoplay,
  autoplayMode: playerOptions.autoplayMode,
  bigPlayButton: playerOptions.bigPlayButton,
  className: playerOptions.class,
  cloudinaryAnalytics: playerOptions.cloudinaryAnalytics,
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
  showLogo: playerOptions.showLogo,
  skin: playerOptions.skin,
  videoJS: hasConfig(playerOptions.videoJS),
  width: playerOptions.width,
  withCredentials: playerOptions.withCredentials,

  colors: playerOptions.colors && stringify(playerOptions.colors),
  controlBar: (JSON.stringify(playerOptions.controlBar) !== JSON.stringify(defaults.controlBar)) ? stringify(playerOptions.controlBar) : null,

  ...getCloudinaryOptions(playerOptions.cloudinary),
  ...getSourceOptions(playerOptions.source),
  ...getAdsOptions(playerOptions.ads),
  ...getPlaylistWidgetOptions(playerOptions.playlistWidget)
});
