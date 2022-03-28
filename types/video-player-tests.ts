/**
 * This file is used to validate the type spec. The code is not actually run.
 */

import VideoPlayer, {Options} from './video-player';

const player: VideoPlayer = new VideoPlayer('player', {}, false);

player.source('test', {
    sourceTypes: ['mp4/h264']
})
player.play();
player.currentPublicId();
player.pause()

const player2 = new VideoPlayer('player2' , { bigPlayButton: false }, false)

const pl = window.cloudinary.videoPlayer('test',{
    cloud_name: 'demo' ,
    secure: true ,
    bigPlayButton: true,
    controls: false
});

interface VideoPlayerWithVideoJs extends VideoPlayer {
    videojs: Options;
}
