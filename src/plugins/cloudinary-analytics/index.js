import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';
import { PLAYER_EVENT } from '../../utils/consts';

class CloudinaryAnalytics {
  constructor(player) {
    this.player = player;
    this.cloudinaryAnalytics = connectCloudinaryAnalytics(this.player.videoElement);
  }

  getMetadata = () => ({
    cloudName: this.player.cloudinary.cloudinaryConfig().cloud_name,
    publicId: this.player.cloudinary.currentPublicId()
  })

  init() {
    this.player.on(PLAYER_EVENT.SOURCE_CHANGED, () => {
      const metadata = this.getMetadata();
      if (metadata.cloudName && metadata.publicId) {
        this.cloudinaryAnalytics.startManuallyNewVideoTracking(metadata, {
          videoPlayer: 'cloudinary video player',
          videoPlayerVersion: VERSION
        });
      }
    });
  }
}

export default function(opts = {}) {
  new CloudinaryAnalytics(this, opts).init();
}
