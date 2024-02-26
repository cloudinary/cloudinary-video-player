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
  static all(selector: string, ...args: any): VideoPlayer[];
}
