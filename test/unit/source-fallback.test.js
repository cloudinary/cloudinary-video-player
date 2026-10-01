import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import VideoPlayer from '../../src/video-player';
import Utils from '../../src/utils';
import { SOURCE_TYPE } from '../../src/utils/consts';
import { getResolveVideoElement, extractOptions } from '../../src/video-player.utils';

const nextTick = () => new Promise(resolve => setTimeout(resolve, 10));

describe('source fallback on media error', () => {
  let vp;
  let handleCldErrorSpy;

  beforeEach(async () => {
    document.body.innerHTML = '<div><video id="fallback-player" class="video-js"></video></div>';
    const elem = getResolveVideoElement('fallback-player');
    vp = new VideoPlayer(elem, extractOptions(elem, { cloudinaryConfig: { cloud_name: 'demo' } }));
    await new Promise(resolve => vp.videojs.ready(resolve));

    vi.spyOn(vp.videojs.cloudinary, 'currentSourceType').mockReturnValue(SOURCE_TYPE.VIDEO);
    handleCldErrorSpy = vi.spyOn(Utils, 'handleCldError').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not run handleCldError when Video.js retries the next source', async () => {
    // Mimics Video.js' own retry, which clears the error and loads the next source
    vp.videojs.one('error', () => vp.videojs.error(null));

    vp.videojs.error({ code: 4 });
    await nextTick();

    expect(handleCldErrorSpy).not.toHaveBeenCalled();
  });

  it('runs handleCldError when no Video.js retry is pending', async () => {
    vp.videojs.error({ code: 4 });
    await nextTick();

    expect(handleCldErrorSpy).toHaveBeenCalledTimes(1);
    expect(vp.videojs.error()).toBeNull();
  });
});
