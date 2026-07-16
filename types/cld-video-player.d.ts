type VideoPlayerFunction = (id: string, options?: any, ready?: () => void) => VideoPlayer;
type VideoMultiPlayersFunction = (selector: string, options?: any, ready?: () => void) => VideoPlayer[];
type VideoPlayerWithProfileFunction = (id: string, options?: any, ready?: () => void) => Promise<VideoPlayer>;
type AsyncPlayerFunction = (id: string, options?: any, ready?: () => void) => Promise<VideoPlayer | { source: () => unknown; loadPlayer: () => Promise<VideoPlayer> }>;
type AsyncPlayersFunction = (selector: string, options?: any, ready?: () => void) => Promise<VideoPlayer[]>;

export const videoPlayer: VideoPlayerFunction;
export const videoPlayers: VideoMultiPlayersFunction;
export const videoPlayerWithProfile: VideoPlayerWithProfileFunction;
export const player: AsyncPlayerFunction;
export const players: AsyncPlayersFunction;


export interface Cloudinary {
  videoPlayer: VideoPlayerFunction;
  videoPlayers: VideoMultiPlayersFunction;
  videoPlayerWithProfile: VideoPlayerWithProfileFunction;
  player: AsyncPlayerFunction;
  players: AsyncPlayersFunction;
}

declare const cloudinary: Cloudinary;
export default cloudinary;

declare global {
  interface Window {
    cloudinary: Cloudinary;
  }
}

/**
 * Event object passed to handlers registered through {@link VideoPlayer.on} /
 * {@link VideoPlayer.one}. The player attaches a `Player` reference to every
 * forwarded (cloudinary/video.js) event; `eventData` is present on the
 * extended events (see {@link PercentsPlayedEvent}, {@link TimePlayedEvent},
 * {@link SeekEvent}).
 */
export interface VideoPlayerEvent {
  type: string;
  /** The VideoPlayer instance that emitted the event. */
  Player: VideoPlayer;
  /** Extra payload attached to forwarded extended events. */
  eventData?: Record<string, unknown>;
  [key: string]: unknown;
}

/** `percentsplayed` — fired as playback crosses each configured percentage. */
export interface PercentsPlayedEvent extends VideoPlayerEvent {
  eventData: { percent: number };
}

/** `timeplayed` — fired as playback crosses each configured time (seconds). */
export interface TimePlayedEvent extends VideoPlayerEvent {
  eventData: { time: number };
}

/** `seek` — fired when the user seeks. */
export interface SeekEvent extends VideoPlayerEvent {
  eventData: { seekStart: number; seekEnd: number };
}

export type VideoPlayerEventHandler<E extends VideoPlayerEvent = VideoPlayerEvent> =
  (event: E, ...args: unknown[]) => void;

/**
 * The underlying video.js player instance (`player.videojs`). Only the members
 * commonly reached for from application code are typed; the index signature is
 * an escape hatch for the rest of the video.js API.
 */
export interface VideoJsPlayer {
  el(): Element;
  on(event: string, handler: (...args: any[]) => void): void;
  one(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler?: (...args: any[]) => void): void;
  trigger(event: string | { type: string; [key: string]: unknown }): void;
  [key: string]: any;
}

export class VideoPlayer {
  cloudinaryConfig(config: object): VideoPlayer;
  currentPublicId(): string;
  currentSourceUrl(): string;
  currentPoster(): object;
  source(publicId: string | object, options?: object): object;
  posterOptions(options: object): VideoPlayer;
  skin(name: string): string;
  playlist(sources: object[], options: object): VideoPlayer;
  playlistByTag(tag: string, options: object): VideoPlayer;
  sourcesByTag(tag: string, options: {}): object[];
  fluid(bool?: boolean): boolean | VideoPlayer;
  play(): VideoPlayer;
  stop(): VideoPlayer;
  playPrevious(): VideoPlayer;
  playNext(): VideoPlayer;
  transformation(trans: []): VideoPlayer;
  sourceTypes(types: string[]): VideoPlayer;
  sourceTransformation(trans: []): VideoPlayer;
  autoShowRecommendations(autoShow?: boolean): VideoPlayer;
  duration(): number;
  height(height: number): VideoPlayer;
  width(width: number): VideoPlayer;
  volume(volume: number): VideoPlayer;
  mute(): VideoPlayer;
  unmute(): VideoPlayer;
  isMuted(): boolean;
  pause(): VideoPlayer;
  currentTime(offsetSeconds?: number): VideoPlayer|number;
  maximize(): VideoPlayer;
  exitMaximize(): VideoPlayer;
  isMaximized(): boolean;
  dispose(): void;
  controls(bool?: boolean): VideoPlayer;
  ima(): object;
  loop(bool?: boolean): VideoPlayer|boolean;
  el(): Element;

  // Event methods — installed at runtime by the player (see setupEventMethods).
  // Known extended events are typed with their payload; the trailing string
  // overload covers every other (video.js / cloudinary) event.
  on(event: 'percentsplayed', handler: VideoPlayerEventHandler<PercentsPlayedEvent>): VideoPlayer;
  on(event: 'timeplayed', handler: VideoPlayerEventHandler<TimePlayedEvent>): VideoPlayer;
  on(event: 'seek', handler: VideoPlayerEventHandler<SeekEvent>): VideoPlayer;
  on(event: string, handler: VideoPlayerEventHandler): VideoPlayer;
  one(event: 'percentsplayed', handler: VideoPlayerEventHandler<PercentsPlayedEvent>): VideoPlayer;
  one(event: 'timeplayed', handler: VideoPlayerEventHandler<TimePlayedEvent>): VideoPlayer;
  one(event: 'seek', handler: VideoPlayerEventHandler<SeekEvent>): VideoPlayer;
  one(event: string, handler: VideoPlayerEventHandler): VideoPlayer;
  off(event: string, handler?: VideoPlayerEventHandler): VideoPlayer;
  trigger(event: string | { type: string; [key: string]: unknown }): VideoPlayer;

  /** Underlying video.js player instance. */
  videojs: VideoJsPlayer;

  static all(selector: string, ...args: any): VideoPlayer[];
}
