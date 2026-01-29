import { describe, it, expect, vi } from 'vitest';
import '../../src/';
import VideoPlayer from '../../src/video-player';
import { getResolveVideoElement, extractOptions } from '../../src/video-player.utils';

describe('secure true test', () => {
  it('test force secure true', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div><video id="test"/></div>';
    const elem = getResolveVideoElement('test');
    const options = extractOptions(elem, { hideContextMenu: true, cloudinaryConfig: { cloud_name: 'demo' } });
    const vp = new VideoPlayer(elem, options, false);
    const conf = vp.videojs.cloudinary.cloudinaryConfig();
    expect(conf.secure).toEqual(true);
  });
  it('test explicit secure false', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div><video id="test"/></div>';
    const elem = getResolveVideoElement('test');
    const options = extractOptions(elem, { hideContextMenu: true, cloudinaryConfig: { cloud_name: 'demo', secure: false } });
    const vp = new VideoPlayer(elem, options, false);
    const conf = vp.videojs.cloudinary.cloudinaryConfig();
    expect(conf.secure).toEqual(false);
  });
});
