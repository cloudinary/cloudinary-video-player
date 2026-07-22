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

// Event methods and the video.js handle.
player.on('ready', () => {});
player.on('play', (event) => {
  const emitter: VideoPlayer = event.Player;
  emitter.pause();
});
player.on('percentsplayed', (event) => {
  const percent: number = event.eventData.percent;
  void percent;
});
player.on('timeplayed', (event) => {
  const time: number = event.eventData.time;
  void time;
});
player.one('seek', (event) => {
  const from: number = event.eventData.seekStart;
  const to: number = event.eventData.seekEnd;
  void from;
  void to;
});
player.off('play');

const bigPlayButton = player.videojs.el().querySelector('.vjs-big-play-button');
void bigPlayButton;
