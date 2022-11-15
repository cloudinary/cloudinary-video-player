import { trackVideoPlayer } from '../../components/cld-analytics/cld-analytics';

class CloudinaryAnalytics {
  constructor(player) {
    this.player = player;
  }

  getMetadata = () => {
    return {
      cloudName: this.player.cloudinary.cloudinaryConfig().cloud_name,
      videoPublicId: this.player.cloudinary.currentPublicId()
    };
  }

  init() {
    trackVideoPlayer(this.player.videoElement, this.getMetadata);
  }
}

export default function(opts = {}) {
  new CloudinaryAnalytics(this, opts).init();
}
