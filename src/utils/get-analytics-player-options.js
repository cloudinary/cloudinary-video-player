const getCloudinaryOptions = (cloudinaryOptions = {}) => ({
  sourceTypes: cloudinaryOptions.sourceTypes || null,
  autoShowRecommendations: cloudinaryOptions.autoShowRecommendations || null,
  fontFace: cloudinaryOptions.fontFace || null,
  posterOptionsPublicId: !!(cloudinaryOptions.posterOptions && cloudinaryOptions.posterOptions.publicId)
});

const getSourceOptions = (sourceOptions = {}) => ({
  shoppable: !!sourceOptions.shoppable,
  shoppableProductsLength: sourceOptions.shoppable && Array.isArray(sourceOptions.shoppable.products) ? sourceOptions.shoppable.products.length : 0,
  ...(sourceOptions.info ? {
    sourceInfoTitle: sourceOptions.info.title || null,
    sourceInfoSubtitle: sourceOptions.info.subtitle || null,
    sourceInfoDescription: sourceOptions.info.description || null
  } : {})
});

const getAdsOptions = (adsOptions = {}) => ({
  adsAdTagUrl: adsOptions.adTagUrl || null,
  adsShowCountdown: adsOptions.showCountdown || null,
  adsAdLabel: adsOptions.adLabel || null,
  adsLocale: adsOptions.locale || null,
  adsPrerollTimeout: adsOptions.prerollTimeout || null,
  adsPostrollTimeout: adsOptions.postrollTimeout || null,
  adsAdsInPlaylist: adsOptions.adsInPlaylist || null
});

const getPlaylistWidgetOptions = (playlistWidgetOptions = {}) => ({
  playlistWidgetDirection: playlistWidgetOptions.direction || null,
  playlistWidgetTotal: playlistWidgetOptions.total || null
});

export const getAnalyticsFromPlayerOptions = (playerOptions) => {
  return {
    showJumpControls: playerOptions.showJumpControls || null,
    seekThumbnails: playerOptions.seekThumbnails || null,
    aiHighlightsGraph: playerOptions.aiHighlightsGraph || null,
    floatingWhenNotVisible: playerOptions.floatingWhenNotVisible || null,
    hideContextMenu: playerOptions.hideContextMenu || null,
    analytics: playerOptions.analytics || null,
    cloudinaryAnalytics: playerOptions.cloudinaryAnalytics || null,
    playedEventPercents: playerOptions.playedEventPercents || null,
    ...getCloudinaryOptions(playerOptions.cloudinary),
    ...getSourceOptions(playerOptions.source),
    ...getAdsOptions(playerOptions.ads),
    ...getPlaylistWidgetOptions(playerOptions.playlistWidget)
  };
};
