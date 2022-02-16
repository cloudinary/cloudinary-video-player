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

const cloudinaryApi = window.cloudinary.Cloudinary.new({
    cloud: {
        cloudName: 'demo'
    },
    url: {
        secure: true
    }
});

const pl = cloudinaryApi.videoPlayer('test',{bigPlayButton: true, controls: false});

interface VideoPlayerWithVideoJs extends VideoPlayer {
    videojs: Options;
}
