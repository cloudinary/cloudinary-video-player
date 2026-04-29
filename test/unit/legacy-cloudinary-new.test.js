import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('~/assets/styles/main.scss', () => ({}));

// Tests the full (sync) UMD entry that preserves the legacy Cloudinary.new() API.
import cloudinary from '../../src/index.full.js';

describe('Cloudinary.new() legacy instance config', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('merges cloud_name from instance into per-call videoPlayer options', () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div><video id="legacy-new-test"/></div>';

    const cld = cloudinary.Cloudinary.new({
      cloud_name: 'demo',
      secure: true,
      private_cdn: false
    });

    const vp = cld.videoPlayer('legacy-new-test', { controls: true });
    const conf = vp.videojs.cloudinary.cloudinaryConfig();
    expect(conf.cloud_name).toEqual('demo');
  });

  it('per-call options override instance config', () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div><video id="legacy-new-override"/></div>';

    const cld = cloudinary.Cloudinary.new({ cloud_name: 'from-instance' });
    const vp = cld.videoPlayer('legacy-new-override', { cloud_name: 'from-call' });
    const conf = vp.videojs.cloudinary.cloudinaryConfig();
    expect(conf.cloud_name).toEqual('from-call');
  });
});
