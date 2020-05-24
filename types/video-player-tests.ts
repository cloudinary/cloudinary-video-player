/**
 * This file is used to validate the type spec. The code is not actually run.
 */

import VideoPlayer from './video-player';

let player: VideoPlayer = new VideoPlayer('player', {}, false);
player.source('test', {
    sourceTypes: ['mp4/h264']
})
player.play();
player.currentPublicId();
player.pause()


let player2 = new VideoPlayer('player2' , {
    bigPlayButton: false,
}, false)
