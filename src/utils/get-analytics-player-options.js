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
  autoShowRecommendations: cloudinaryOptions.autoShowRecommendations,
  fontFace: cloudinaryOptions.fontFace,
  posterOptions: hasConfig(cloudinaryOptions.posterOptions),
  posterOptionsPublicId: cloudinaryOptions.posterOptions && hasConfig(cloudinaryOptions.posterOptions.publicId)
});

const getTranscriptOptions = (textTracks = {}) => {
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
    srtFromUrl: tracksArr.some((track) => track.url?.endsWith('.srt')) || null
  };
};

const getSourceOptions = (sourceOptions = {}) => ({
  sourceTypes: sourceOptions.sourceTypes,
  abrProfile: sourceOptions.abrProfile,
  chapters: sourceOptions.chapters && (sourceOptions.chapters.url ? 'url' : 'inline-chapters'),
  visualSearch: hasConfig(sourceOptions.visualSearch),
  recommendations: sourceOptions.recommendations && sourceOptions.recommendations.length,
  shoppable: hasConfig(sourceOptions.shoppable),
  shoppableProductsLength: sourceOptions.shoppable && sourceOptions.shoppable.products && sourceOptions.shoppable.products.length,
  ...(sourceOptions.info ? {
    sourceInfoTitle: sourceOptions.info.title,
    sourceInfoSubtitle: sourceOptions.info.subtitle,
    sourceInfoDescription: sourceOptions.info.description
  } : {}),
  ...(sourceOptions.textTracks ? {
    ...(hasConfig(sourceOptions.textTracks) && getTranscriptOptions(sourceOptions.textTracks)),
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
  type: playerOptions.type,

  colors: playerOptions.colors && JSON.stringify(playerOptions.colors),
  controlBar: (JSON.stringify(playerOptions.controlBar) !== JSON.stringify(defaults.controlBar)) && JSON.stringify(playerOptions.controlBar),

  ...getCloudinaryOptions(playerOptions.cloudinary),
  ...getSourceOptions(playerOptions.sourceOptions),
  ...getAdsOptions(playerOptions.ads),
  ...getPlaylistWidgetOptions(playerOptions.playlistWidget)
});
