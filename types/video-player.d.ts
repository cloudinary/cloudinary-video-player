/* eslint-disable */

// Type definitions for ./src/video-player.js
// Project: [LIBRARY_URL_HERE]
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
// normalizeAutoplay.!0

import {VideoJsPlayerOptions} from "video.js";
import {Transformation} from "cloudinary-core"

declare namespace VideoPlayer {

    interface PosterOptions {
        publicId: string,
        transformation: Transformation[]
    }

    /**
     * Default HLS options < Default options < Markup options < Player options
     */
    interface Options {
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
            /**
             * The total number of next videos to include in the widget.
             * A maximum of four thumbnails can be displayed at once.
             * If a larger number is specified for total, the widget scrolls to show the rest.
             */
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
        /**
         * Access all underlying capabilities of the VideoJS API
         */
        videoJS: VideoJsPlayerOptions;
    }

    interface SourceOptions {
        preload?: string,
        publicId: string,
        sourceTransformation?: Transformation[],
        sourceTypes?: string[],
    }

    interface AdsOptions {
        /*
        * The full URL of the adTag to run
        */
        adTagUrl: string,
        /*
        * string value setting when to call the adTag
        * first-video: Calls the adTag on the first video in the playlist only.
        * every-video: Calls the adTag on every video in the playlist.
        * default first-video
        */
        adsInPlaylist?: string,
        showCountdown?: boolean,
        adLabel?: string
        locale?: string,
        prerollTimeout?: number
        postrollTimeout?: number

    }

    class BaseSource {
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

    interface imaAdPlayer {
        playAd: (adTad: string) => void;
    }

    class VideoSource {
        constructor(publicId: any, options?: {});

        _type: string;
        poster: (publicId: string, options?: {}) => VideoSource;
        sourceTypes: (types: Array<string>) => VideoSource;
        sourceTransformation: (trans: any) => VideoSource;
        info: (info: {}) => VideoSource;
        recommendations: (recommends: any) => VideoSource;
        objectId: number;
    }

    class ImageSource {
        constructor(publicId: string, options?: {});

        _type: string;
    }

    /**
     *
     */
    class VideoPlayer {

        /**
         *
         * @param elem
         *          The video element for the player
         * @param options
         *        Video player options
         * @param ready
         *        Is the player ready to play
         */
        new(elem: string, options: Options, ready: boolean);

        /**
         *
         * @param config
         */
        cloudinaryConfig(config: any): any;

        /**
         *
         */
        currentPublicId(): string;

        /**
         *
         */
        currentSourceUrl(): string;

        /**
         *
         */
        currentPoster(): ImageSource;

        /**
         *
         * @param publicId
         * @param options
         */
        source(publicId: string, options: object): VideoSource;

        /**
         *
         * @param options
         */
        posterOptions(options: any): VideoPlayer;

        /**
         *
         * @param name
         */
        skin(name: any): string;

        /**
         *
         * @param sources
         * @param options
         */
        playlist(sources: Array<{}>, options: {}): VideoPlayer;

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
}
