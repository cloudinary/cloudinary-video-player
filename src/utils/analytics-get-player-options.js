// eslint-disable-next-line complexity
export const analyticsGetPlayerOptions = (playerOptions) => {
  return {
    showJumpControls: playerOptions.showJumpControls || null,
    seekThumbnails: playerOptions.seekThumbnails || null,
    aiHighlightsGraph: playerOptions.aiHighlightsGraph || null,
    floatingWhenNotVisible: playerOptions.floatingWhenNotVisible || null,
    hideContextMenu: playerOptions.hideContextMenu || null,
    analytics: playerOptions.analytics || null,
    cloudinaryAnalytics: playerOptions.cloudinaryAnalytics || null,
    playedEventPercents: playerOptions.playedEventPercents || null,
    ...(playerOptions.cloudinary ? {
      sourceTypes: playerOptions.cloudinary.sourceTypes || null,
      autoShowRecommendations: playerOptions.cloudinary.autoShowRecommendations || null,
      transformation: playerOptions.cloudinary.transformation || null,
      fontFace: playerOptions.cloudinary.fontFace || null,
      ...(playerOptions.cloudinary.posterOptions ? {
        posterOptionsPublicId: playerOptions.cloudinary.posterOptions.publicId || null,
        posterOptionsTransformation: playerOptions.cloudinary.posterOptions.transformation || null
      } : {})
    } : {}),
    ...(playerOptions.source ? {
      sourcePublicId: playerOptions.source.publicId,
      shoppable: playerOptions.source.shoppable || null,
      ...(playerOptions.source.info ? {
        sourceInfoTitle: playerOptions.source.info.title || null,
        sourceInfoSubtitle: playerOptions.source.info.subtitle || null,
        sourceInfoDescription: playerOptions.source.info.description || null
      } : {})
    } : {}),
    ...(playerOptions.ads ? {
      adsAdTagUrl: playerOptions.ads.adTagUrl || null,
      adsShowCountdown: playerOptions.ads.showCountdown || null,
      adsAdLabel: playerOptions.ads.adLabel || null,
      adsLocale: playerOptions.ads.locale || null,
      adsPrerollTimeout: playerOptions.ads.prerollTimeout || null,
      adsPostrollTimeout: playerOptions.ads.postrollTimeout || null,
      adsAdsInPlaylist: playerOptions.ads.adsInPlaylist || null
    } : {}),
    ...(playerOptions.playlistWidget ? {
      playlistWidgetDirection: playerOptions.playlistWidget.direction || null,
      playlistWidgetTotal: playerOptions.playlistWidget.total || null
    } : {})
  };
};
