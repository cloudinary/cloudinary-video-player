import '../../src/';
import VideoPlayer from '../../src/video-player';

describe('secure true test', () => {
  it('test force secure true', async () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div><video id="test"/></div>';
    const vp = new VideoPlayer('test', { hideContextMenu: true, cloudinaryConfig: { cloud_name: 'demo' } }, false);
    const conf = vp.videojs.cloudinary.cloudinaryConfig();
    expect(conf.secure).toEqual(true);
  });
  it('test explicit secure false', async () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div><video id="test"/></div>';
    const vp = new VideoPlayer('test', { hideContextMenu: true, cloudinaryConfig: { cloud_name: 'demo', secure: false } }, false);
    const conf = vp.videojs.cloudinary.cloudinaryConfig();
    expect(conf.secure).toEqual(false);
  });
});
