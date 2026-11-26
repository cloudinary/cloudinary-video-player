/**
 * The internal usage report (FR-028): the player version, the cloud name and the features in use, nothing else.
 * Features come from the options as in v4 (`get-analytics-player-options.js`), with one rule added:
 * a value is sent only when it is a boolean, a number or a value from a fixed list. A string that the
 * integrator writes freely (URL, title, description, tag, label, font, color) is sent as `true` only.
 */

/** Options sent with their value when the integrator changed them from the default. */
const VALUE_OPTIONS = [
  'aiHighlightsGraph',
  'aspectRatio',
  'autoShowRecommendations',
  'autoplay',
  'autoplayMode',
  'bigPlayButton',
  'breakpoints',
  'chaptersButton',
  'controls',
  'cropMode',
  'debug',
  'floatingWhenNotVisible',
  'fluid',
  'hideContextMenu',
  'loop',
  'maxDpr',
  'maxTries',
  'muted',
  'pictureInPictureToggle',
  'playbackRates',
  'playedEventPercents',
  'playedEventTimes',
  'playsinline',
  'preload',
  'resourceType',
  'seekThumbnails',
  'showJumpControls',
  'showLogo',
  'skin',
  'sourceTypes',
  'type',
  'videoTimeout',
  'withCredentials',
] as const;

/** Options sent as `true` when the integrator set them (their value is free text or an object). */
const FLAG_OPTIONS = [
  'analytics',
  'cloudinaryAnalytics',
  'colors',
  'cropPadColor',
  'download',
  'fontFace',
  'hdr',
  'logoImageUrl',
  'logoOnclickUrl',
  'posterOptions',
  'videoSources',
] as const;

/** Options that features are derived from. */
const DERIVED_OPTIONS = [
  'adaptiveStreaming',
  'ads',
  'chapters',
  'description',
  'info',
  'lazy',
  'playlistWidget',
  'poster',
  'recommendations',
  'schedule',
  'textTracks',
  'title',
] as const;

type UsageReportOption = (typeof VALUE_OPTIONS)[number] | (typeof FLAG_OPTIONS)[number] | (typeof DERIVED_OPTIONS)[number];

/** The options the report reads: player options merged with the current source's options. */
export type UsageReportOptions = { readonly [K in UsageReportOption]?: unknown };

export interface UsageReportInput {
  /** The player version. */
  readonly version: string;
  readonly cloudName: string;
  readonly options: UsageReportOptions;
  /** The player defaults (`DEFAULTS`): an option equal to its default is not a feature in use. */
  readonly defaults: UsageReportOptions;
}

/** Query parameters for the report request: `vpVersion`, `cloudName` and one entry per feature in use. */
export interface UsageReport {
  readonly vpVersion: string;
  readonly cloudName: string;
  readonly [feature: string]: string;
}

type Features = Readonly<Record<string, unknown>>;

const isObject = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const field = (value: unknown, key: string): unknown => (isObject(value) ? value[key] : undefined);

const inUse = (value: unknown): boolean =>
  Array.isArray(value) ? value.length > 0 : isObject(value) ? Object.keys(value).length > 0 : Boolean(value);

const flag = (condition: boolean): true | undefined => condition || undefined;

/** `value`, or `undefined` when it equals the default. */
const changed = (value: unknown, fallback: unknown): unknown => (JSON.stringify(value) === JSON.stringify(fallback) ? undefined : value);

/** Only scalars and lists of scalars become parameters; anything else is dropped. */
const toParam = (value: unknown): string | undefined => {
  const scalar = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
  return Array.isArray(value) ? value.join(',') : scalar ? String(value) : undefined;
};

const chaptersMode = (chapters: unknown): string | undefined => {
  if (chapters === true) {
    return 'auto';
  }
  if (typeof chapters === 'string' || inUse(field(chapters, 'url'))) {
    return 'url';
  }
  return chapters ? 'inline-chapters' : undefined;
};

const textTracksFeatures = (textTracks: unknown): Features => {
  if (!isObject(textTracks) || !inUse(textTracks)) {
    return {};
  }
  const subtitles = Array.isArray(textTracks.subtitles) ? textTracks.subtitles : [];
  const tracks = [textTracks.captions, ...subtitles].filter(isObject);
  const urls = tracks.map((track) => track.url).filter((url) => typeof url === 'string');
  const autoLoaded = tracks.filter((track) => !track.url);
  const options = textTracks.options;
  const json = JSON.stringify(textTracks);
  return {
    textTracks: true,
    textTracksLength: tracks.length,
    textTracksOptions: isObject(options) && inUse(options) ? Object.keys(options).join(',') : undefined,
    pacedTextTracks: flag(json.includes('"maxWords":')),
    wordHighlight: flag(json.includes('"wordHighlight":')),
    transcriptLanguages: autoLoaded.map((track) => track.language ?? '').join(',') || undefined,
    transcriptAutoLoaded: flag(autoLoaded.length > 0),
    // v4 key name, typo included: the analytics service already stores it.
    transcriptFromURl: flag(urls.some((url) => url.endsWith('.transcript'))),
    vttFromUrl: flag(urls.some((url) => url.endsWith('.vtt'))),
    srtFromUrl: flag(urls.some((url) => url.endsWith('.srt'))),
    styledTextTracksTheme: field(options, 'theme'),
    styledTextTracksFont: flag(inUse(field(options, 'fontFace'))),
    styledTextTracksFontSize: field(options, 'fontSize'),
    styledTextTracksGravity: field(options, 'gravity'),
    styledTextTracksBox: flag(inUse(field(options, 'box'))),
    styledTextTracksStyle: flag(inUse(field(options, 'style'))),
    styledTextTracksWordHighlightStyle: flag(inUse(field(options, 'wordHighlightStyle'))),
  };
};

const adsFeatures = (ads: unknown): Features => ({
  adsAdTagUrl: flag(inUse(field(ads, 'adTagUrl'))),
  adsShowCountdown: field(ads, 'showCountdown'),
  adsAdLabel: flag(inUse(field(ads, 'adLabel'))),
  adsLocale: field(ads, 'locale'),
  adsPrerollTimeout: field(ads, 'prerollTimeout'),
  adsPostrollTimeout: field(ads, 'postrollTimeout'),
  adsAdsInPlaylist: field(ads, 'adsInPlaylist'),
});

const playlistWidgetFeatures = (widget: unknown): Features => ({
  playlist: flag(inUse(field(widget, 'playlist'))),
  playlistByTag: flag(inUse(field(widget, 'playlistByTag'))),
  playlistWidgetDirection: field(widget, 'direction'),
  playlistWidgetTotal: field(widget, 'total'),
});

/** Builds the usage report for one source. Sending it (and honoring `allowUsageReport`) is the caller's job. */
export function buildUsageReport({ version, cloudName, options, defaults }: UsageReportInput): UsageReport {
  const set = (key: UsageReportOption): unknown => changed(options[key], defaults[key]);
  const lazy = set('lazy');
  const poster = set('poster');
  const recommendations = set('recommendations');
  const info = set('info');
  const features: Features = {
    ...Object.fromEntries(VALUE_OPTIONS.map((key) => [key, set(key)])),
    ...Object.fromEntries(FLAG_OPTIONS.map((key) => [key, flag(inUse(set(key)))])),
    lazy: flag(lazy === true || isObject(lazy)),
    lazyLoadOnScroll: flag(field(lazy, 'loadOnScroll') === true),
    schedule: flag(inUse(field(set('schedule'), 'weekly'))),
    poster: poster === true ? 'auto' : typeof poster === 'string' ? 'url' : undefined,
    posterOptionsPublicId: flag(inUse(field(set('posterOptions'), 'publicId'))),
    chapters: chaptersMode(set('chapters')),
    recommendations: Array.isArray(recommendations) ? recommendations.length : flag(inUse(recommendations)),
    abrStrategy: changed(field(options.adaptiveStreaming, 'strategy'), field(defaults.adaptiveStreaming, 'strategy')),
    sourceInfo: flag(inUse(info)),
    sourceTitle: flag(inUse(set('title')) || inUse(field(info, 'title'))),
    sourceDescription: flag(inUse(set('description')) || inUse(field(info, 'subtitle')) || inUse(field(info, 'description'))),
    ...textTracksFeatures(set('textTracks')),
    ...adsFeatures(set('ads')),
    ...playlistWidgetFeatures(set('playlistWidget')),
  };
  const params = Object.entries(features).flatMap(([key, value]) => {
    const param = toParam(value);
    return param === undefined ? [] : [[key, param] as const];
  });
  return { vpVersion: version, cloudName, ...Object.fromEntries(params) };
}
