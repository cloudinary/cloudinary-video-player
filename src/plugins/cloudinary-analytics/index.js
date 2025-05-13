import isPlainObject from 'lodash/isPlainObject';
import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';
import { PLAYER_EVENT } from '../../utils/consts';

class CloudinaryAnalytics {
  constructor(player, options) {
    this.player = player;
    this.cloudinaryAnalytics = connectCloudinaryAnalytics(this.player.videoElement, {
      playerAdapter: this.getCloudinaryVideoPlayerAdapter(),
    });
    this.currentVideoMetadata = {
      cloudName: null,
      publicId: null
    };
    this.analyticsOptions = options;
  }

  getMetadata = () => ({
    cloudName: this.player.cloudinary.cloudinaryConfig().cloud_name,
    publicId: this.player.cloudinary.currentPublicId()
  });

  sourceChanged = (e, { source }) => {
    const metadata = this.getMetadata();

    if (metadata.cloudName && metadata.publicId) {
      const isLiveStream = source.resourceConfig().type === 'live';
      this.currentVideoMetadata = metadata;
      this.cloudinaryAnalytics.startManualTracking({
        ...metadata,
        ...(isLiveStream ? { type: 'live' } : {}),
      }, {
        ...(isPlainObject(this.analyticsOptions) ? this.analyticsOptions : {}),
        videoPlayerType: 'cloudinary video player',
        videoPlayerVersion: VERSION,
      });
    } else if (this.currentVideoMetadata.cloudName !== metadata.cloudName || this.currentVideoMetadata.publicId !== metadata.publicId) {
      this.cloudinaryAnalytics.stopManualTracking();
    }
  };

  getCloudinaryVideoPlayerAdapter = () => {
    const createCldVPEventListener = (eventName, callback) => {
      this.player.on(eventName, callback);
      return () => {
        this.player.off(eventName, callback);
      };
    };

    return {
      onCanPlay: (callback) => createCldVPEventListener('canplay', callback),
      onCanPlayThrough: (callback) => createCldVPEventListener('canplaythrough', callback),
      onComplete: (callback) => createCldVPEventListener('complete', callback),
      onDurationChange: (callback) => createCldVPEventListener('durationchange', callback),
      onEmptied: (callback) => createCldVPEventListener('emptied', callback),
      onEnded: (callback) => createCldVPEventListener('ended', callback),
      onError: (callback) => createCldVPEventListener('error', callback),
      onLoadedData: (callback) => createCldVPEventListener('loadeddata', callback),
      onLoadedMetadata: (callback) => createCldVPEventListener('loadedmetadata', callback),
      onLoadStart: (callback) => createCldVPEventListener('loadstart', callback),
      onPause: (callback) => createCldVPEventListener('pause', callback),
      onPlay: (callback) => createCldVPEventListener('play', callback),
      onPlaying: (callback) => createCldVPEventListener('playing', callback),
      onProgress: (callback) => createCldVPEventListener('progress', callback),
      onRateChange: (callback) => createCldVPEventListener('ratechange', callback),
      onSeeked: (callback) => createCldVPEventListener('seeked', callback),
      onSeeking: (callback) => createCldVPEventListener('seeking', callback),
      onStalled: (callback) => createCldVPEventListener('stalled', callback),
      onSuspend: (callback) => createCldVPEventListener('suspend', callback),
      onTimeUpdate: (callback) => createCldVPEventListener('timeupdate', callback),
      onVolumeChange: (callback) => createCldVPEventListener('volumechange', callback),
      onWaiting: (callback) => createCldVPEventListener('waiting', callback),

      getCurrentSrc: () => this.player.videoElement.currentSrc,
      getCurrentTime: () => this.player.currentTime(),
      getReadyState: () => this.player.videoElement.readyState,
      getDuration: () => this.player.duration(),
    };
  };

  init() {
    this.player.on(PLAYER_EVENT.CLD_SOURCE_CHANGED, this.sourceChanged);
  }
}

export default function(opts = {}) {
  new CloudinaryAnalytics(this, opts).init();
}
