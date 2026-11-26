/**
 * Options of the player and of one source: the single definition (contracts/options.md).
 * `schema.json` is generated from `PlayerOptions`; validation and the attribute parser read these types.
 * No mapped or conditional types here: ts-json-schema-generator must read every exported option type.
 */

/** One transformation step with v4/SDK keys (`width`, `crop`, `effect`, `overlay`, `variables`, `if`, …). */
export type TransformationStep = Record<string, unknown>;

/** A transformation: one step, a chain of steps, or a raw string such as `"e_blur:200"` (research.md R-07). */
export type Transformation = TransformationStep | TransformationStep[] | string;

/**
 * Cloudinary delivery settings. Every key is accepted in snake_case (v4 SDK names) or camelCase.
 * `api_secret`, `sign_url` and `auth_token` are never used: sign URLs on your server.
 */
export interface CloudinaryConfig {
  /**
   * Cloudinary cloud name. Alias: `cloud_name`.
   * @examples ["demo"]
   */
  cloudName?: string;
  /** Alias of `cloudName`. */
  cloud_name?: string;
  /**
   * Use HTTPS URLs.
   * @default true
   */
  secure?: boolean;
  /** Deliver from a private CDN distribution. Alias: `private_cdn`. */
  privateCdn?: boolean;
  /** Alias of `privateCdn`. */
  private_cdn?: boolean;
  /** Custom domain for HTTPS delivery. Alias: `secure_distribution`. */
  secureDistribution?: string;
  /** Alias of `secureDistribution`. */
  secure_distribution?: string;
  /** Custom domain (CNAME) for HTTP delivery. */
  cname?: string;
  /** Spread HTTP delivery over CDN subdomains. Alias: `cdn_subdomain`. */
  cdnSubdomain?: boolean;
  /** Alias of `cdnSubdomain`. */
  cdn_subdomain?: boolean;
  /** Spread HTTPS delivery over CDN subdomains. Alias: `secure_cdn_subdomain`. */
  secureCdnSubdomain?: boolean;
  /** Alias of `secureCdnSubdomain`. */
  secure_cdn_subdomain?: boolean;
  /** Use the root path (images only; a video URL with it fails, as in v4). Alias: `use_root_path`. */
  useRootPath?: boolean;
  /** Alias of `useRootPath`. */
  use_root_path?: boolean;
  /** SEO suffix added to the URL. Alias: `url_suffix`. */
  urlSuffix?: string;
  /** Alias of `urlSuffix`. */
  url_suffix?: string;
  /** Use the short `/iu/` URL form for image uploads. */
  shorten?: boolean;
}

/** Poster settings. */
export interface PosterOptions {
  /** Public ID of an image to use as the poster. */
  publicId?: string;
  /** Transformation of the poster image. */
  transformation?: Transformation;
  /** Show a solid color instead of a poster image. */
  posterColor?: string;
}

/** Style of captions and subtitles. */
export interface TextTrackOptions {
  /**
   * Built-in caption theme (for example `default`, `videojs-default`, `yellow-outlined`, `player-colors`, `3d`).
   * @default "default"
   */
  theme?: string;
  /** Font of the captions. Any Google font. */
  fontFace?: string;
  /**
   * Font size in relative units, such as `%` or `em`.
   * @default "medium"
   */
  fontSize?: string;
  /**
   * Position of the captions on the video or in `box`.
   * @default "bottom"
   */
  gravity?: 'top' | 'right' | 'bottom' | 'left' | 'center' | 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  /** Location and size of the box that shows the captions. */
  box?: { x?: string; y?: string; width?: string; height?: string };
  /** CSS properties of the caption text. */
  style?: Record<string, string>;
  /** Highlight the spoken word (paced captions). */
  wordHighlight?: boolean;
  /** CSS properties of the highlighted word. */
  wordHighlightStyle?: Record<string, string>;
  /** Maximum number of words in one cue (paced captions). */
  maxWords?: number;
  /** Seconds added to every cue time. */
  timeOffset?: number;
}

/** One caption or subtitle track. Without `url`, the Cloudinary transcript of the video is used. */
export interface TextTrack {
  /** Label in the captions menu. */
  label?: string;
  /** Language code, for example `en`. */
  language?: string;
  /** Show this track at start. */
  default?: boolean;
  /** URL of a VTT or SRT file. */
  url?: string;
  /** Maximum number of words in one cue (paced captions). */
  maxWords?: number;
  /** Highlight the spoken word (paced captions). */
  wordHighlight?: boolean;
  /** Seconds added to every cue time. */
  timeOffset?: number;
}

/** Captions, subtitles and their style. */
export interface TextTracks {
  /** Style of all tracks. */
  options?: TextTrackOptions;
  /** The captions track. */
  captions?: TextTrack;
  /** Subtitle tracks. */
  subtitles?: TextTrack[];
}

/** Title, subtitle and description shown in the title bar. Plain text only. */
export interface SourceInfo {
  title?: string;
  subtitle?: string;
  description?: string;
}

/** Adaptive streaming settings. */
export interface AdaptiveStreamingOptions {
  /**
   * Quality strategy for HLS and DASH.
   * @default "balanced"
   */
  strategy?: 'fastStart' | 'balanced' | 'highQuality';
}

/** One entry of the source switcher. */
export interface VideoSourceItem extends SourceOptions {
  /** Label in the source switcher. */
  label?: string;
}

/** Options of one source. At player level they are the defaults for every source. */
export interface SourceOptions extends CloudinaryConfig {
  /**
   * Public ID of the video, or an absolute media URL.
   * @examples ["cld-sample-video"]
   */
  publicId?: string;
  /** The source object (v4 `player()` configurations). */
  source?: SourceOptions;
  /** Cloudinary settings for this source; snake_case or camelCase keys. */
  cloudinaryConfig?: CloudinaryConfig;
  /**
   * Delivery type, for example `upload`, `private`, `authenticated` or `live`.
   * @default "upload"
   */
  type?: string;
  /**
   * Resource type. Alias: `resource_type`.
   * @default "video"
   */
  resourceType?: string;
  /** Transformation of this source only. The next source does not inherit it. */
  transformation?: Transformation;
  /** Transformation per source type, for example `{ "hls": [...] }`. */
  sourceTransformation?: Record<string, Transformation>;
  /** Raw transformation string added to the URL. Alias: `raw_transformation`. */
  rawTransformation?: string;
  /**
   * Source types in order of preference: `auto`, `hls`, `dash`, `mp4`, `webm/vp9`, `audio`, and so on.
   * @default ["auto"]
   */
  sourceTypes?: string[];
  /**
   * Choose the resolution from the player width and the device pixel ratio.
   * @default false
   */
  breakpoints?: boolean;
  /**
   * Maximum device pixel ratio for `breakpoints` (1, 1.5 or 2).
   * @default 2
   */
  maxDpr?: number;
  /** Aspect ratio of the delivered video, for example `16:9`. */
  aspectRatio?: string;
  /** How `aspectRatio` resizes: `fill`, `pad` or `smart` (automatic gravity). */
  cropMode?: 'fill' | 'pad' | 'smart';
  /** Background color for `cropMode: 'pad'`, for example `#000000`. */
  cropPadColor?: string;
  /**
   * Deliver HDR where the device supports it.
   * @default false
   */
  hdr?: boolean;
  /**
   * Poster: an image URL or public ID, `{ publicId, transformation }`, `true` for the saved poster,
   * or `false` for none. Default: the poster saved for the video in Cloudinary.
   */
  poster?: string | boolean | { publicId: string; transformation?: Transformation };
  /** Poster settings. */
  posterOptions?: PosterOptions;
  /** Captions and subtitles. */
  textTracks?: TextTracks;
  /** Chapters: `true` (from Cloudinary), a VTT URL, `{ "url": "…" }`, or `{ "<seconds>": "<title>" }`. */
  chapters?: boolean | string | Record<string, string>;
  /** Title: text, or `true` to read it from the asset metadata. */
  title?: string | boolean;
  /** Description: text, or `true` to read it from the asset metadata. */
  description?: string | boolean;
  /** Title, subtitle and description. */
  info?: SourceInfo;
  /**
   * Show a download button.
   * @default false
   */
  download?: boolean;
  /** Sources recommended at the end of this source, or a function that returns them. */
  recommendations?: SourceOptions[] | (() => SourceOptions[] | Promise<SourceOptions[]>);
  /**
   * Show the recommendations when the source ends.
   * @default false
   */
  autoShowRecommendations?: boolean;
  /** Sources for the source switcher. */
  videoSources?: VideoSourceItem[];
  /** Query parameters added to every media URL. */
  queryParams?: Record<string, string | number | boolean>;
  /**
   * Send cookies with every request for this source.
   * @default false
   */
  withCredentials?: boolean;
  /**
   * Adaptive streaming settings.
   * @default {"strategy":"balanced"}
   */
  adaptiveStreaming?: AdaptiveStreamingOptions;
  /**
   * Send the anonymous usage report and `_s=vp` on video-service requests.
   * @default true
   */
  allowUsageReport?: boolean;
}

/** Player colors. */
export interface Colors {
  /**
   * Background color of the controls.
   * @default "#000000"
   */
  base?: string;
  /**
   * Color of the progress bar and the active elements.
   * @default "#FF620C"
   */
  accent?: string;
  /**
   * Text and icon color.
   * @default "#FFFFFF"
   */
  text?: string;
}

/** Video ads (IMA). */
export interface AdOptions {
  /** VAST or VMAP ad tag URL. */
  adTagUrl?: string;
  /**
   * Show the remaining ad time.
   * @default true
   */
  showCountdown?: boolean;
  /**
   * Label shown during an ad.
   * @default "Advertisement"
   */
  adLabel?: string;
  /**
   * Language of the ad UI.
   * @default "en"
   */
  locale?: string;
  /**
   * Milliseconds to wait for a pre-roll.
   * @default 5000
   */
  prerollTimeout?: number;
  /**
   * Milliseconds to wait for a post-roll.
   * @default 5000
   */
  postrollTimeout?: number;
  /**
   * Which playlist items show ads.
   * @default "first-video"
   */
  adsInPlaylist?: 'first-video' | 'every-video';
}

/** Playlist widget. */
export interface PlaylistWidgetOptions {
  /** Show the widget. */
  show?: boolean;
  /**
   * Layout direction.
   * @default "horizontal"
   */
  direction?: 'horizontal' | 'vertical';
  /**
   * Number of items shown (0 = all).
   * @default 0
   */
  total?: number;
  /** CSS selector of an element outside the player to render the widget in. */
  selector?: string;
}

/** Custom data sent with Cloudinary analytics. */
export interface CloudinaryAnalyticsOptions {
  customData1?: string;
  customData2?: string;
  customData3?: string;
  customData4?: string;
  customData5?: string;
}

/** Lazy loading settings. */
export interface LazyOptions {
  /**
   * Load the player when it scrolls into view, without a click.
   * @default false
   */
  loadOnScroll?: boolean;
}

/** One weekly time range. */
export interface ScheduleRange {
  /** Day of the week, for example `monday`. */
  day: string;
  /** Start time, `HH:MM` in the viewer's local time. */
  start: string;
  /** Duration in hours. */
  duration: number;
}

/** Weekly schedule: outside it, the player shows the poster only. */
export interface ScheduleOptions {
  weekly?: ScheduleRange[];
}

/** Options of `player()`, `videoPlayer()` and `<cld-video-player>`. */
export interface PlayerOptions extends SourceOptions {
  /**
   * Start playback when the player loads.
   * @default false
   */
  autoplay?: boolean;
  /** When to start playback: `always`, `on-scroll` (when the player is visible) or `never`. */
  autoplayMode?: 'always' | 'on-scroll' | 'never';
  /**
   * Start muted. The volume is preset to 0.4, so that unmuting is not at full volume.
   * @default false
   */
  muted?: boolean;
  /**
   * Play again from the start at the end.
   * @default false
   */
  loop?: boolean;
  /**
   * Show the controls.
   * @default false
   */
  controls?: boolean;
  /** Play inline on iPhone. Default: `true` on iOS, `false` elsewhere. */
  playsinline?: boolean;
  /**
   * How much media to load before play.
   * @default "metadata"
   */
  preload?: 'auto' | 'metadata' | 'none';
  /**
   * Fill the width of the container and keep the aspect ratio.
   * @default false
   */
  fluid?: boolean;
  /**
   * Show the large play button: `true`, `false`, or `init` (only before the first play).
   * @default true
   */
  bigPlayButton?: boolean | 'init';
  /** Playback speeds in the speed menu, for example `[0.5, 1, 1.5, 2]`. Empty: no menu. */
  playbackRates?: number[];
  /**
   * Skin.
   * @default "dark"
   */
  skin?: 'dark' | 'light';
  /**
   * Player colors.
   * @default {"base":"#000000","accent":"#FF620C","text":"#FFFFFF"}
   */
  colors?: Colors;
  /**
   * Font of the player UI. Any Google font.
   * @default "Inter"
   */
  fontFace?: string;
  /**
   * Show the Cloudinary logo.
   * @default true
   */
  showLogo?: boolean;
  /** Logo image URL (http or https). Default: the Cloudinary logo. */
  logoImageUrl?: string;
  /**
   * Page opened by a click on the logo (http or https).
   * @default "https://cloudinary.com/"
   */
  logoOnclickUrl?: string;
  /**
   * Show the 10-second jump buttons.
   * @default false
   */
  showJumpControls?: boolean;
  /**
   * Show the picture-in-picture button.
   * @default false
   */
  pictureInPictureToggle?: boolean;
  /**
   * Show the chapters menu button.
   * @default false
   */
  chaptersButton?: boolean;
  /**
   * Show thumbnails over the seek bar.
   * @default true
   */
  seekThumbnails?: boolean;
  /**
   * Show the AI highlights graph over the seek bar.
   * @default false
   */
  aiHighlightsGraph?: boolean;
  /**
   * Disable the browser context menu on the player.
   * @default false
   */
  hideContextMenu?: boolean;
  /**
   * Float the player in a corner when it scrolls out of view.
   * @default "none"
   */
  floatingWhenNotVisible?: 'left' | 'right' | 'none';
  /** Playlist widget. */
  playlistWidget?: PlaylistWidgetOptions;
  /** Video ads (IMA). */
  ads?: AdOptions;
  /**
   * Send events to Google Analytics.
   * @default false
   */
  analytics?: boolean;
  /**
   * Send Cloudinary analytics: `true`, `false`, or custom data.
   * @default true
   */
  cloudinaryAnalytics?: boolean | CloudinaryAnalyticsOptions;
  /**
   * Percentages of the video that send `percentsplayed`.
   * @default [25,50,75,100]
   */
  playedEventPercents?: number[];
  /** Seconds of playback that send `timeplayed`. */
  playedEventTimes?: number[];
  /** Player profile: built-in name, saved name or URL. `player()` and the element only. */
  profile?: string;
  /**
   * Apply the configuration saved for the video in Cloudinary. `player()` and the element only.
   * @default true
   */
  videoConfig?: boolean;
  /**
   * Load the player on click (or on scroll); show the poster until then.
   * @default false
   */
  lazy?: boolean | LazyOptions;
  /** Weekly schedule: outside it, the player shows the poster only. */
  schedule?: ScheduleOptions;
  /**
   * Report unknown, renamed, removed and invalid options in the console.
   * @default false
   */
  debug?: boolean;
  /**
   * Number of "video not ready" checks before the error.
   * @default 3
   */
  maxTries?: number;
  /**
   * Milliseconds between "video not ready" checks.
   * @default 55000
   */
  videoTimeout?: number;
  /**
   * Read the Cloudinary error with a one-byte `GET` instead of `HEAD` (cookies only with `withCredentials`).
   * @default false
   */
  fetchErrorUsingGet?: boolean;
}

/** Delivery settings after normalization: camelCase keys only, never secrets (data-model §2). */
export interface CloudConfig {
  cloudName?: string;
  secure: boolean;
  privateCdn?: boolean;
  secureDistribution?: string;
  cname?: string;
  cdnSubdomain?: boolean;
  secureCdnSubdomain?: boolean;
  useRootPath?: boolean;
  urlSuffix?: string;
  shorten?: boolean;
}

/** Internal options: not part of the public contract or of `schema.json`. */
export interface InternalOptions {
  _internalAnalyticsMetadata?: Record<string, unknown>;
}
