import cloudinary from 'cloudinary-core';
import VideoPlayer from '../../src/video-player';
cloudinary.VideoPlayer = VideoPlayer;

describe('secure true test', () => {
  it('test force secure true', () => {
    const cld = cloudinary.Cloudinary.new({ cloud_name: 'demo' });
    jest.useFakeTimers();
    document.body.innerHTML = '<div><video id="test"/></div>';
    let vp = new VideoPlayer('test', { hideContextMenu: true, cloudinaryConfig: cld }, false);
    let conf = vp.videojs.cloudinary.cloudinaryConfig().config();
    expect(conf.secure).toEqual(true);
  });
  it('test explicit secure false', () => {
    const cld = cloudinary.Cloudinary.new({ cloud_name: 'demo' });
    jest.useFakeTimers();
    document.body.innerHTML = '<div><video id="test"/></div>';
    let vp = new VideoPlayer('test', { hideContextMenu: true, cloudinaryConfig: cld, secure: false }, false);
    let conf = vp.videojs.cloudinary.cloudinaryConfig().config();
    expect(conf.secure).toEqual(false);
  });
});
