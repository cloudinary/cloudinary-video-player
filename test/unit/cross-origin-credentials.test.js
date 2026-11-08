import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import VideoPlayer from '../../src/video-player';
import { getResolveVideoElement, extractOptions } from '../../src/video-player.utils';

describe('withCredentials and the media element crossorigin attribute', () => {
  let vp;

  beforeEach(async () => {
    document.body.innerHTML = '<div><video id="cors-player" class="video-js"></video></div>';
    const elem = getResolveVideoElement('cors-player');
    vp = new VideoPlayer(elem, extractOptions(elem, { cloudinaryConfig: { cloud_name: 'demo' } }));
    await new Promise(resolve => vp.videojs.ready(resolve));
  });

  afterEach(() => {
    vp.dispose();
  });

  it('does not set crossorigin for a withCredentials source', () => {
    vp.source('sea_turtle', { withCredentials: true });

    expect(vp.videojs.crossOrigin()).toBeNull();
  });
});
