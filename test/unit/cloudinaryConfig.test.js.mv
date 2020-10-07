import cloudinary from 'cloudinary-core';
import VideoPlayer from '../../src/video-player';
import window from 'global/window';
import videojs from '../../node_modules/video.js';
// import defaults from '../../src/config/defaults.js';
const cld = cloudinary.Cloudinary.new({ cloud_name: 'demo' });
cloudinary.VideoPlayer = VideoPlayer;


describe('secure true test', () => {
  it('test force secure true', () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div><video id="test"/></div>';
    let vp = new VideoPlayer('test', { hideContextMenu: true }, false);
    console.log(vp);
  })
})
