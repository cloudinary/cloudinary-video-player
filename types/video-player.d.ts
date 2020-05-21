/* eslint-disable */
// Type definitions for ../src/video-player.js
// Project: [LIBRARY_URL_HERE]
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

import {VideoJsPlayerOptions} from "video.js";
import {Configuration, Transformation} from "cloudinary-core"

export interface PosterOptions {
    /**
     * @param The public id of the poster
     */
    publicId: string,
    /**
     * @param Cloudinary transformations to apply to the poster
     */
    transformation: Transformation[]
}


/** @typedef {Object} json
 * @property {Object} ads
 * Enables serving ads in your video player based on leading video ad standards such as VAST, VPAID, and VMAP, including Google DoubleClick or AdSense.
 * @property {Boolean} allowUsageReport
 * Cloudinary can optionally collect aggregated statistics about how the video player is being used.
 * The collected data is used in aggregate form to help us improve future versions of the video player and cannot be used to identify individual video viewers.
 * When true (default), Cloudinary collects data on events performed by the video player
 * @property {Boolean} analytics
 * Whether to activate analytics for video player events. Default: false
 * @property {Boolean} autoplay
 * Whether to apply standard HTML5 autoplay. Default: false.
 * @property {String|Boolean} bigPlayButton
 * Whether to show a larger play button.
 *  Possible values:
 *  true: Always show big play button.
 *  false: Never show big play button.
 *  init: Show big play button on initial load only.
 *  Default: false
 * @property {Object} colors
 * The colors to use for the player UI. The values must be supplied as hex color codes. You can set:
 * base: The base color for the player's controls and information bars as well as the base color of the central play button.
 * accent: The color for the progress bar and volume level.
 * text: The color for all text and icons.
 * @property {Boolean} controls
 * Whether to display the video player controls
 * @property {Object} floatingWhenNotVisible
 * Whether to display a floating player in the corner of the screen when a video is playing and less than half the player is visible.
 * Possible values:
 * right: Shows floating player in the bottom right of the screen
 * left: Shows floating player in the bottom left of the screen
 * @property {Boolean} fluid
 * Whether to activate fluid layout mode, which dynamically adjusts the player size to fit its container or window.
 * @property {String} fontFace
 * The font to use for text elements in the video player. If not specified, the player loads with the default player font-family: Fira Sans.
 * @property {Boolean} hideContextMenu
 * Whether to hide the context menu that appears when right-clicking on the player. Default: false
 * @property {String} logoImageUrl
 * The URL for the logo image to display in the player's control bar. Relevant only when showLogo is true. Default: Cloudinary logo.
 * @property {String} logoOnclickUrl
 * The URL where the viewer will be sent when clicking the logo in the player control bar. Relevant only when showLogo is true. Default: https://cloudinary.com
 * @property {Array} playbackRates
 * An array of playback rates to display in the control bar. Allows the user to change the speed that the video plays at.
 * @property {Object} playlistWidget
 * Adds a playlist widget to the video player.
 * @property {String} poster
 * The publicId from the poster image
 * @property {Object} posterOptions
 * A default poster that is shown every time a new video loads. It can include transformation settings
 * @property {Boolean} showLogo
 * Whether to show a clickable logo within the player. You can customize the logo image (logoImageUrl) and logo url (logoOnclickUrl) for your own requirements. Default: true
 * @property {String} transformation
 * Default transformation to apply on every source video that plays in the player
 * @property {Object} videoJS
 * Access all underlying capabilities of the VideoJS API
 */
export interface Options {
    bigPlayButton?: boolean | string,
    colors?: {
        base: string,
        accent: string,
        text: string
    },
    controls?: boolean,
    floatingWhenNotVisible?: string,
    fluid?: boolean,
    autoplay?: boolean,
    fontFace?: string | boolean,
    hideContextMenu?: boolean,
    playbackRates?: string[],
    playlistWidget?: {
        direction?: string,
        total?: number,
    },
    poster?: string,
    posterOptions?: PosterOptions,
    showLogo?: boolean,
    logoImageUrl?: string,
    logoOnclickUrl?: string,
    transformation?: Transformation[],
    ads?: AdsOptions,
    analytics?: boolean,
    allowUsageReport?: boolean,
    videoJS?: VideoJsPlayerOptions;
}

/**
 * Video Source options
 * @param preload [options.preload]
 *        The type of standard HTML5 video preloading to use. Relevant only when autoplay is false or autoplayMode is never.
 *        Possible values:
 *        auto: Default. Begin loading the video immediately.
 *        metadata: Only load the video metadata.
 *        none: Don't load any video data.
 *  @param publicId [options.publicId]
 *         The Cloudinary Public ID of the video source to use when the player loads.
 *  @param sourceTransformation [options.sourceTransformation]
 *         Default transformations to apply to a specific source type.
 *  @param sourceTypes [options.sourceTypes]
 *         The video source types (and optionally the corresponding codecs) that will be available for the player to request (as appropriate for the current browser). If a source type can't be played in the requesting browser, the next source in the array will be tried. Add the codec after the source type and separate with a '/', for example: mp4/h265.
 *         For HLS and MPEG-DASH, use the values hls and dash respectively and optionally specify a codec as described above.
 *         For audio only, use audio.
 *         If you also define a codec as part of a transformation, this will override the source type.
 *         Default: ['webm/vp9','mp4/h265','mp4'].
 *         The default is configured to be the most optimal combination of source types for modern browsers.
 */
export interface SourceOptions {
    preload?: string,
    publicId?: string,
    sourceTransformation?: Transformation[],
    sourceTypes?: string[],
}
/** @typedef {Object} json
 * @property {String} adLabel
 * Optional. Alternative or translated text for the 'Advertisement' countdown label. Relevant only when showCountdown is true.
 * @property {String} adTagUrl
 * The full URL of the adTag to run
 * @property {String} adsInPlaylist
 * string value setting when to call the adTag
 * first-video: Calls the adTag on the first video in the playlist only.
 * every-video: Calls the adTag on every video in the playlist.
 * default first-video
 * @property {String} locale
 * Optional. Locale for ad localization. Can be any ISO 639-1 (two-letter) or ISO 639-2,(three-letter) locale code.
 * This setting affects the language of relevant elements within the adTag, such as the Skip option. Default: en.
 * @property {Number} postrollTimeout
 * Optional. Maximum time (in milliseconds) to wait for a postroll ad to start.
 * If the ad does not start an adtimeout event is triggered.
 * @property {Number} prerollTimeout
 * Optional. Maximum time (in milliseconds) to wait for a preroll ad to start.
 * If the ad does not start an adtimeout event is triggered.
 * @property {Boolean} showCountdown
 * Optional. When true, the 'Advertisement' countdown label is displayed in small text in the bottom center of the video player
 * along with a counter showing the time (in seconds) until the end of the video. Default: true.
 */

export interface AdsOptions {
    adTagUrl: string,
    adsInPlaylist?: string,
    showCountdown?: boolean,
    adLabel?: string
    locale?: string,
    prerollTimeout?: number
    postrollTimeout?: number

}

export class BaseSource {
    constructor(publicId: any, options?: {});
    publicId: (publicId: string) => BaseSource;
    cloudinaryConfig: (config: {}) => BaseSource;
    resourceConfig: (config: any) => BaseSource;
    transformation: (trans: any) => BaseSource;
    queryParams: (params: any) => BaseSource;
    getType: () => string;
    config(): any;
    url({transformation}?: {
        transformation: any;
    }): string;
}

export interface imaAdPlayer {
    playAd: (adTad: string) => void;
}

export class VideoSource {
    constructor(publicId: any, options?: {});
    _type: string;
    poster: (publicId: string, options?: {}) => VideoSource;
    sourceTypes: (types: Array<string>) => VideoSource;
    sourceTransformation: (trans: any) => VideoSource;
    info: (info: {}) => VideoSource;
    recommendations: (recommends: any) => VideoSource;
    objectId: number;
}

export class ImageSource {
    constructor(publicId: string, options?: {});

    _type: string;
}

export class Playlist {
    constructor(context: CloudinaryContext, sources?: VideoSource|string[], { repeat, autoAdvance, presentUpcoming }?: {
        repeat?: boolean;
        autoAdvance?: boolean;
        presentUpcoming?: boolean;
    });
    enqueue: (source: VideoSource|string, options?: {}) => VideoSource;
    currentIndex: (index: number) => number;
    presentUpcoming: (delay: number) => number;
    autoAdvance: (delay: number) => number;
    list: () => VideoSource[];
    player: () => VideoPlayer;
    dispose: () => void;
    resetState: () => void;
    playItem(item: VideoSource): VideoSource;
    playAtIndex(index: number): VideoSource;
    currentSource(): VideoSource;
    removeAt(index: number): Playlist;
    repeat(repeat: any): boolean;
    first(): VideoSource;
    last(): VideoSource;
    next(): VideoSource;
    nextIndex(index: VideoSource): number;
    previousIndex(): number;
    playFirst(): VideoSource;
    playLast(): VideoSource;
    isLast(): boolean;
    isFirst(): boolean;
    length(): number;
    playNext(): VideoSource;
    playPrevious(): VideoSource;
}

export class CloudinaryContext {
    constructor(player: any, options?: {});
    player: any;
    source: (source: any, options?: {}) => any;
    buildSource: (publicId: any, options?: {}) => any;
    posterOptions: (options: any) => any;
    cloudinaryConfig: (config: any) => any;
    transformation: (trans: any) => any;
    sourceTypes: (types: any) => any;
    getCurrentSources: () => any;
    sourceTransformation: (trans: any) => any;
    on: (...args: any[]) => any;
    one: (...args: any[]) => any;
    off: (...args: any[]) => any;
    autoShowRecommendations: (autoShow: any) => any;
    dispose: () => void;
    currentSourceType(): any;
    currentPublicId(): any;
    currentPoster(): any;
}

export default class VideoPlayer {
    /**
     *
     * @param elem
     *          The video element for the player
     * @param options
     *        Video player options
     * @param ready
     *        Is the player ready to play
     */
    constructor(elem: string, options: Options, ready: boolean)

    /**
     *
     * @param config
     *        The cloudinary core configurations
     * @return {Object} VideoPlayer class
     */
    cloudinaryConfig(config: Configuration.Options): VideoPlayer;

    /**
     * @return {String} The current video publicId
     *
     */
    currentPublicId(): string;

    /**
     * @return {String} The current video url
     */
    currentSourceUrl(): string;

    /**
     * @return {Object} An ImageSource object of the video poster
     */
    currentPoster(): ImageSource;

    /**
     *
     * @param {String} publicId
     *                 The publicId from the video source
     * @param {Object} options
     *                 The source configuration
     * @return {Object} A video source object
     */
    source(publicId: string, options: SourceOptions): VideoSource;

    /**
     *
     * @param {Object} options
     *                 The Configuration for the poster
     * @return {Object} The VideoPlayer object
     */
    posterOptions(options: PosterOptions): VideoPlayer;

    /**
     *
     * @param {String} name
     *        The name of the skin to apply to the video player
     * @return {string}
     *         the class prefix of the skin
     */
    skin(name: string): string;

    /**
     *
     * @param sources
     * @param options
     */
    playlist(sources: Array<SourceOptions>, options: {}): VideoPlayer;

    /**
     *
     * @param tag
     * @param options
     */
    playlistByTag(tag: string, options: {}): Array<VideoSource>;

    /**
     *
     * @param tag
     * @param options
     */
    sourcesByTag(tag: string, options: {}): Array<VideoSource>;

    /**
     *
     * @param bool
     * @return
     */
    fluid(bool: boolean): boolean | undefined | VideoPlayer;

    /**
     *
     * @return
     */
    play(): VideoPlayer;

    /**
     *
     * @return
     */
    stop(): VideoPlayer;

    /**
     *
     * @return
     */
    playPrevious(): VideoPlayer;

    /**
     *
     * @return
     */
    playNext(): VideoPlayer;

    /**
     *
     * @param trans
     */
    transformation(trans: Transformation[]): VideoPlayer;

    /**
     *
     * @param types
     */
    sourceTypes(types: string[]): VideoPlayer;

    /**
     *
     * @param trans
     */
    sourceTransformation(trans: Transformation[]): VideoPlayer;

    /**
     *
     * @param autoShow
     */
    autoShowRecommendations(autoShow: boolean): VideoPlayer;

    /**
     *
     */
    duration(): number;

    /**
     *
     * @param dimension
     * @return
     */
    height(dimension: number): VideoPlayer;

    /**
     *
     * @param dimension
     * @return
     */
    width(dimension: number): VideoPlayer;

    /**
     *
     * @param volume
     * @return
     */
    volume(volume: number): VideoPlayer;

    /**
     *
     * @return
     */
    mute(): VideoPlayer;

    /**
     *
     * @return
     */
    unmute(): VideoPlayer;

    /**
     *
     */
    isMuted(): boolean;

    /**
     *
     * @return
     */
    pause(): VideoPlayer;

    /**
     *
     * @param offsetSeconds
     * @return
     */
    currentTime(offsetSeconds: number): VideoPlayer;

    /**
     *
     * @return
     */
    maximize(): VideoPlayer;

    /**
     *
     * @return
     */
    exitMaximize(): VideoPlayer;

    /**
     *
     */
    isMaximized(): boolean;

    /**
     *
     */
    dispose(): void;

    /**
     *
     * @param bool
     * @return
     */
    controls(bool: boolean): VideoPlayer;

    /**
     *
     * @return
     */
    ima(): imaAdPlayer;

    /**
     *
     * @param bool
     * @return
     */
    loop(bool: boolean): VideoPlayer;

    /**
     *
     */
    el(): Element;

    /**
     *
     * @param selector
     * @param ...args
     * @return
     */
    static all(selector: string, ...args: any): VideoPlayer[];

    /**
     *
     * @param bool
     * @return
     */
    allowUsageReport(bool: any): boolean;

    /**
     *
     * @param conf
     */
    initTextTracks(conf: any): void;

    /**
     *
     */
    nbCalls: number;

    /**
     *
     * @param maxNumberOfCalls
     * @param timeout
     */
    reTryVideo(maxNumberOfCalls: number, timeout: number): void;

    /**
     *
     * @return
     */
    isVideoReady(): boolean;

    /**
     *
     * @param options
     * @return
     */
    playlistWidget(options: any): boolean;

    /**
     *
     */
    adsEnabled: boolean;
}
