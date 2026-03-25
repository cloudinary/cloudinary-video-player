import { describe, it, expect, vi } from 'vitest';
import '../../src/';
import VideoPlayer from '../../src/video-player';
import { getResolveVideoElement, extractOptions } from '../../src/video-player.utils';

// Same merge as Cloudinary.new(instanceConfig).videoPlayer(el, opts) in src/index.umd.js
const mergeLegacyNewOptions = (instanceConfig = {}, callOpts = {}) =>
  Object.assign({}, instanceConfig, callOpts);

describe('Cloudinary.new() legacy instance config', () => {
  it('merges cloud_name from instance into per-call videoPlayer options', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div><video id="legacy-new-test"/></div>';
    const elem = getResolveVideoElement('legacy-new-test');
    const instanceConfig = {
      cloud_name: 'demo',
      secure: true,
      private_cdn: false
    };
    const options = extractOptions(elem, mergeLegacyNewOptions(instanceConfig, { controls: true }));
    const vp = new VideoPlayer(elem, options, false);
    const conf = vp.videojs.cloudinary.cloudinaryConfig();
    expect(conf.cloud_name).toEqual('demo');
  });

  it('per-call options override instance config', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div><video id="legacy-new-override"/></div>';
    const elem = getResolveVideoElement('legacy-new-override');
    const options = extractOptions(
      elem,
      mergeLegacyNewOptions({ cloud_name: 'from-instance' }, { cloud_name: 'from-call' })
    );
    const vp = new VideoPlayer(elem, options, false);
    const conf = vp.videojs.cloudinary.cloudinaryConfig();
    expect(conf.cloud_name).toEqual('from-call');
  });
});
