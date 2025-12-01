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

const getSourceOptions = (sourceOptions = {}) => ({
  poster: (() => {
    if (sourceOptions.poster === true) return 'auto';
    if (typeof sourceOptions.poster === 'string') return 'url';
    return undefined;
  })(),
  posterOptions: hasConfig(sourceOptions.posterOptions),
  posterOptionsPublicId: sourceOptions.posterOptions && hasConfig(sourceOptions.posterOptions.publicId),
  autoShowRecommendations: sourceOptions.autoShowRecommendations,
  fontFace: sourceOptions.fontFace,
  sourceTypes: sourceOptions.sourceTypes,
  resourceType: sourceOptions.resourceType,
  chapters: (() => {
    if (sourceOptions.chapters === true) return 'auto';
    if (sourceOptions.chapters && sourceOptions.chapters.url) return 'url';
    if (sourceOptions.chapters) return 'inline-chapters';
    return undefined;
  })(),
  visualSearch: sourceOptions.visualSearch,
  download: hasConfig(sourceOptions.download),
  recommendations: sourceOptions.recommendations && sourceOptions.recommendations.length,
  ...(hasConfig(sourceOptions.adaptiveStreaming) ? {
    abrStrategy: sourceOptions?.adaptiveStreaming?.strategy === defaults.adaptiveStreaming.strategy ? undefined : sourceOptions?.adaptiveStreaming?.strategy,
  } : {}),
  shoppable: hasConfig(sourceOptions.shoppable),
  shoppableProductsLength: hasConfig(sourceOptions.shoppable) && sourceOptions.shoppable.products.length,
  ...(sourceOptions.title || sourceOptions.description || sourceOptions.info ? {
    sourceInfo: hasConfig(sourceOptions.info),
    sourceTitle: (typeof sourceOptions.title === 'string' ? sourceOptions.title : sourceOptions.info?.title),
    sourceDescription: (typeof sourceOptions.description === 'string' ? sourceOptions.description : sourceOptions.info?.subtitle || sourceOptions.info?.description)
  } : {}),
  ...(hasConfig(sourceOptions.textTracks) ? getTextTracksOptions(sourceOptions.textTracks) : {}),
  interactionAreas: hasConfig(sourceOptions.interactionAreas),
  videoSources: !!sourceOptions.videoSources,
});

const getTextTracksOptions = (textTracks = {}) => {
  const tracksArr = [textTracks.captions, ...(textTracks.subtitles || [])];
  return {
    textTracks: hasConfig(textTracks),
    textTracksLength: tracksArr.length,
    textTracksOptions: hasConfig(textTracks.options) && Object.keys(textTracks.options).join(','),
    pacedTextTracks: hasConfig(textTracks) && JSON.stringify(textTracks || {}).includes('"maxWords":') || null,
    wordHighlight: hasConfig(textTracks) && JSON.stringify(textTracks || {}).includes('"wordHighlight":') || null,
    transcriptLanguages: tracksArr.filter((track) =>  !track.url).map((track) => track.language || '').join(',') || null,
    transcriptAutoLoaded: tracksArr.some((track) => !track.url) || null,
    transcriptFromURl: tracksArr.some((track) => track.url?.endsWith('.transcript')) || null,
    vttFromUrl: tracksArr.some((track) => track.url?.endsWith('.vtt')) || null,
    srtFromUrl: tracksArr.some((track) => track.url?.endsWith('.srt')) || null,
    ...(textTracks.options ? {
      styledTextTracksTheme: textTracks.options.theme,
      styledTextTracksFont: textTracks.options.fontFace,
      styledTextTracksFontSize: textTracks.options.fontSize,
      styledTextTracksGravity: textTracks.options.gravity,
      styledTextTracksBox: hasConfig(textTracks.options.box),
      styledTextTracksStyle: hasConfig(textTracks.options.style),
      styledTextTracksWordHighlightStyle: hasConfig(textTracks.options.wordHighlightStyle)
    } : {})
  };
};

const getAdsOptions = (adsOptions = {}) => ({
  adsAdTagUrl: adsOptions.adTagUrl,
  adsShowCountdown: adsOptions.showCountdown,
  adsAdLabel: adsOptions.adLabel,
  adsLocale: adsOptions.locale,
  adsPrerollTimeout: adsOptions.prerollTimeout,
  adsPostrollTimeout: adsOptions.postrollTimeout,
  adsAdsInPlaylist: adsOptions.adsInPlaylist
});

const getPlaylistOptions = (playlistWidgetOptions = {}) => ({
  playlist: playlistWidgetOptions.playlist,
  playlistByTag: playlistWidgetOptions.playlistByTag,
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
  type: playerOptions.type,

  colors: playerOptions.colors && JSON.stringify(playerOptions.colors),
  controlBar: (JSON.stringify(playerOptions.controlBar) !== JSON.stringify(defaults.controlBar)) && JSON.stringify(playerOptions.controlBar),

  ...getSourceOptions(playerOptions.sourceOptions || {}),
  ...getAdsOptions(playerOptions.ads),
  ...getPlaylistOptions(playerOptions.playlistWidget)
});
