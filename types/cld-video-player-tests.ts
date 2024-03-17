/**
 * This file is used to validate the type spec. The code does not actually run.
 */

import cloudinary, { videoPlayer, videoPlayerWithProfile, VideoPlayer } from './cld-video-player';

const player: VideoPlayer = cloudinary.videoPlayer('player', {}, () => {});

player.source('test', {
  sourceTypes: ['mp4/h264']
});
player.play();
player.pause();

const vPlayer: VideoPlayer = videoPlayer('player', {});

vPlayer.source('test');

async () => {
  const profilePlayer = await videoPlayerWithProfile('player', {
    constrols: false,
    fontFace: 'Merienda'
  });

  profilePlayer.source({
    publicId: 'elephants',
    profile: 'default'
  });
};
