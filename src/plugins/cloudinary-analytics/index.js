import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';
import { PLAYER_EVENT } from '../../utils/consts';

class CloudinaryAnalytics {
  constructor(player) {
    this.player = player;
    this.cloudinaryAnalytics = connectCloudinaryAnalytics(this.player.videoElement);
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

  init() {
    this.player.on(PLAYER_EVENT.CLD_SOURCE_CHANGED, this.sourceChanged);
  }
}

export default function(opts = {}) {
  new CloudinaryAnalytics(this, opts).init();
}
