import defaults from 'config/defaults';

const stringify = (obj) => new URLSearchParams(obj).toString();

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
  posterOptions: !!cloudinaryOptions.posterOptions,
  posterOptionsPublicId: !!(cloudinaryOptions.posterOptions && cloudinaryOptions.posterOptions.publicId)
});

const getSourceOptions = (sourceOptions = {}) => ({
  chapters: sourceOptions.chapters && (sourceOptions.chapters.url ? 'url' : JSON.stringify(sourceOptions.chapters)),
  recommendations: sourceOptions.recommendations && sourceOptions.recommendations.length,
  shoppable: sourceOptions.shoppable && !!sourceOptions.shoppable,
  shoppableProductsLength: sourceOptions.shoppable && sourceOptions.shoppable.products && sourceOptions.shoppable.products.length,
  ...(sourceOptions.info ? {
    sourceInfoTitle: sourceOptions.info.title,
    sourceInfoSubtitle: sourceOptions.info.subtitle,
    sourceInfoDescription: sourceOptions.info.description
  } : {}),
  textTracks: sourceOptions.textTracks && !!sourceOptions.textTracks
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
  muted: playerOptions.muted,
  playedEventPercents: playerOptions.playedEventPercents,
  playsinline: playerOptions.playsinline,
  preload: playerOptions.preload,
  seekThumbnails: playerOptions.seekThumbnails,
  showJumpControls: playerOptions.showJumpControls,
  showLogo: playerOptions.showLogo,
  skin: playerOptions.skin,
  width: playerOptions.width,

  colors: playerOptions.colors && stringify(playerOptions.colors),
  controlBar: (JSON.stringify(playerOptions.controlBar) !== JSON.stringify(defaults.controlBar)) ? stringify(playerOptions.controlBar) : null,

  ...getCloudinaryOptions(playerOptions.cloudinary),
  ...getSourceOptions(playerOptions.source),
  ...getAdsOptions(playerOptions.ads),
  ...getPlaylistWidgetOptions(playerOptions.playlistWidget)
});
