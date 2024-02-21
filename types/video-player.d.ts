type VideoPlayerFunction = (id: string, options?: any, ready?: () => void) => any;
type VideoMultiPlayersFunction = (selector: string, options?: any, ready?: () => void) => any;
type VideoPlayerWithProfileFunction = (id: string, options?: any, ready?: () => void) => any;

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
    new : (options?: any) => CommonCloudinary;
  }
}

declare global {
  interface Window {
      cloudinary: Cloudinary
  }
}
