type VideoPlayerFunction = (id: string, options?: any, ready?: () => void) => VideoPlayer;
type VideoMultiPlayersFunction = (selector: string, options?: any, ready?: () => void) => VideoPlayer[];
type VideoPlayerWithProfileFunction = (id: string, options?: any, ready?: () => void) => Promise<VideoPlayer>;

export const videoPlayer: VideoPlayerFunction;
export const videoPlayers: VideoMultiPlayersFunction;
export const videoPlayerWithProfile: VideoPlayerWithProfileFunction;

interface CommonCloudinary {
  videoPlayer: VideoPlayerFunction;
  videoPlayers: VideoMultiPlayersFunction;
  videoPlayerWithProfile: VideoPlayerWithProfileFunction;
}

export interface Cloudinary extends CommonCloudinary {
  videoPlayer: VideoPlayerFunction;
  videoPlayers: VideoMultiPlayersFunction;
  videoPlayerWithProfile: VideoPlayerWithProfileFunction;
  Cloudinary: {
    new: (options?: any) => CommonCloudinary;
  };
}

declare global {
  interface Window {
    cloudinary: Cloudinary;
  }
}

export class VideoPlayer {
  /**
   *
   * @param config
   *        The cloudinary core configurations
   * @return {Object} VideoPlayer class
   */
  cloudinaryConfig(config: object): VideoPlayer;

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
  currentPoster(): object;

  /**
   *
   * @param {String} publicId
   *                 The publicId from the video source
   * @param {Object} options
   *                 The source configuration
   * @return {Object} A video source object
   */
  source(publicId: string | object, options?: object): object;

  /**
   *
   * @param {Object} options
   *                 The Configuration for the poster
   * @return {Object} The VideoPlayer object
   */
  posterOptions(options: object): VideoPlayer;

  /**
   *
   * @param {String} name
   *        The name of the skin to apply to the video player
   * @return {string}
   *         the class prefix of the skin
   */
  skin(name: string): string;

  /**
   * Create a playlist
   * @param {Array.<Object>} sources
   *        A list of sources for the playlist
   *
   * @param {Object} options
   *        Options from the playlist sources the options would be added to each source
   * @return {Object} The video player
   */
  playlist(sources: object[], options: object): VideoPlayer;

  /**
   * Create a playlist from a cloudinary tag
   * @param {String} tag
   *        The tag name to build the playlist from
   * @param {Object} options
   *        Options from the playlist sources the options would be added to each source
   * @return {Object} The video player
   */
  playlistByTag(tag: string, options: object): VideoPlayer;

  /**
   * Get an Array ot sources from a cloudinary tag
   * @param {String} tag
   *        The tag name to get the sources by
   * @param {Object} options
   *        Options to apply to all sources
   * @return An array of sources
   */
  sourcesByTag(tag: string, options: {}): object[];

  /**
   * Should the player be responsive
   * @param {boolean} bool
   * @return
   */
  fluid(bool: boolean): boolean | undefined | VideoPlayer;

  /**
   * Play the video
   * @return {Object} the video player
   */
  play(): VideoPlayer;

  /**
   * Stop the video
   * @return {Object} the video player
   */
  stop(): VideoPlayer;

  /**
   * In a playlist play the previous video
   * @return {Object} the video player
   */
  playPrevious(): VideoPlayer;

  /**
   *
   * In a playlist play the next video
   * @return {Object} the video player
   */
  playNext(): VideoPlayer;

  /**
   * Apply transformations to the video
   * @param {Array.Transformation} trans
   *        An array of transformations to apply
   * @return {Object} the video player
   */
  transformation(trans: []): VideoPlayer;

  /**
   * Set the source types for the video
   * @param {array} types
   *        The array of types
   * @return {Object} the video player
   */
  sourceTypes(types: string[]): VideoPlayer;

  /**
   *
   * Apply transformations to this source
   * @param {Array.Transformation} trans
   *        An array of transformations to apply
   * @return {Object} the video player
   */
  sourceTransformation(trans: []): VideoPlayer;

  /**
   * get or set would auto recommendation be shown
   *
   * @param {boolean} autoShow
   * @return {Object} the video player
   */
  autoShowRecommendations(autoShow?: boolean): VideoPlayer;

  /**
   * Get the video duration
   * @return {number} the video duration
   */
  duration(): number;

  /**
   * Set the player height
   * @param {number} dimension
   *        The height in pixels
   * @return {Object} the video player
   */
  height(dimension: number): VideoPlayer;

  /**
   * Set the width of the player
   * @param {number} dimension
   *        The width in pixels
   * @return {Object} the video player
   */
  width(dimension: number): VideoPlayer;

  /**
   * Set the player volume
   * @param {number} volume
   *        Volume to apply
   * @return {Object} the video player
   */
  volume(volume: number): VideoPlayer;

  /**
   * Mute the video
   * @return {Object} the video player
   */
  mute(): VideoPlayer;

  /**
   * Unmute the player
   * @return {Object} the video player
   */
  unmute(): VideoPlayer;

  /**
   * Is the player muted
   * @return {boolean}
   *         true if the player is muted
   */
  isMuted(): boolean;

  /**
   * Pause the video
   * @return {Object} the video player
   */
  pause(): VideoPlayer;

  /**
   * Set or get the current video time
   * @param {number} offsetSeconds
   *        optional if given the video would seek to that time
   *        if non is given would return the current video time
   * @return {object} the video player
   */
  currentTime(offsetSeconds?: number): VideoPlayer|number;

  /**
   * Enter fullscreen mode
   * @return {object} The video player
   */
  maximize(): VideoPlayer;

  /**
   * Exit full screen mode
   * @return {object} The video player
   */
  exitMaximize(): VideoPlayer;

  /**
   * Is the video player is in fullscreen mode
   * @return {boolean}
   */
  isMaximized(): boolean;

  /**
   * Delete the current video player
   */
  dispose(): void;

  /**
   * Get or set would the controls be shown
   * @param {boolean} bool
   *        if given true to show the controls false to hide
   *        if non is given returns the current control status
   * @return {object|Boolean}
   *         if the an options is given would return the video player
   *         if not the boolean with the current state
   */
  controls(bool?: boolean): VideoPlayer;

  /**
   * Get the interface to play ads
   * @return {object} interface to play ads
   */
  ima(): object;

  /**
   * get or set if the video should automatically restart
   * @param {boolean} bool
   *        true to auto restart false not to
   * @return {object|Boolean}
   *         if the an options is given would return the video player
   *         if not the boolean with the current state
   */
  loop(bool?: boolean): VideoPlayer|boolean;

  /**
   * Proxy method for videojs el
   */
  el(): Element;

  /**
   * create video players from a css class class selector
   * @param {string} selector
   *        Class name
   * @param ...args
   *        arguments to pass to the video player constructor
   * @return {Array.VideoPlayer}
   *         An array of video player objects
   */
  static all(selector: string, ...args: any): VideoPlayer[];
}
