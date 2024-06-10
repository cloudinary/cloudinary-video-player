import videojs from 'video.js';
import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';
import { PLAYER_EVENT } from '../../utils/consts';

class CloudinaryAnalytics {
  constructor(player) {
    this.player = player;
    this.shouldUseCustomEvents = videojs.browser.IS_IOS;
    this.cloudinaryAnalytics = connectCloudinaryAnalytics(this.player.videoElement, {
      customEvents: this.shouldUseCustomEvents,
    });
    this.currentVideMetadata = {
      cloudName: null,
      publicId: null
    };
  }

  getMetadata = () => ({
    cloudName: this.player.cloudinary.cloudinaryConfig().cloud_name,
    publicId: this.player.cloudinary.currentPublicId()
  });

  sourceChanged = () => {
    const metadata = this.getMetadata();
    if (metadata.cloudName && metadata.publicId) {
      this.currentVideMetadata = metadata;
      this.cloudinaryAnalytics.startManualTracking(metadata, {
        videoPlayerType: 'cloudinary video player',
        videoPlayerVersion: VERSION
      });
    } else if (this.currentVideMetadata.cloudName !== metadata.cloudName || this.currentVideMetadata.publicId !== metadata.publicId) {
      this.cloudinaryAnalytics.stopManualTracking();
    }
  };

  dispatchCustomEventOnVideoPlayer = (name, detail = {}) => {
    const ev = new CustomEvent(`cld-custom-${name}`, {
      detail,
    });
    this.player.videoElement.dispatchEvent(ev);
  };

  connectCustomEvents = () => {
    this.player.on(PLAYER_EVENT.PLAY, () => this.dispatchCustomEventOnVideoPlayer('play'));
    this.player.on(PLAYER_EVENT.PAUSE, () => this.dispatchCustomEventOnVideoPlayer('pause'));
    this.player.on(PLAYER_EVENT.EMPTIED, () => this.dispatchCustomEventOnVideoPlayer('emptied'));
    this.player.on(PLAYER_EVENT.LOADED_METADATA, () => {
      const videoDuration = this.player.videoElement.duration || null;
      this.dispatchCustomEventOnVideoPlayer('loadedmetadata', {
        videoDuration,
      });
    });
  };

  init() {
    // only for iOS there is problem with reporting events because videojs re-triggers events and stops native ones
    if (this.shouldUseCustomEvents) {
      this.connectCustomEvents();
    }

    this.player.on(PLAYER_EVENT.CLD_SOURCE_CHANGED, this.sourceChanged);
  }
}

export default function(opts = {}) {
  new CloudinaryAnalytics(this, opts).init();
}
