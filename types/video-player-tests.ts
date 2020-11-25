/**
 * This file is used to validate the type spec. The code is not actually run.
 */

import VideoPlayer, {Options} from './video-player';
import {Cloudinary} from 'cloudinary-core';

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

const cloudinaryApi = Cloudinary.new({cloud_name: 'demo', secure: true});
let pl = cloudinaryApi.videoPlayer('test',{bigPlayButton: true, controls: false});




interface VideoPlayerWithVideoJs extends VideoPlayer {
    videojs: Options;

}
