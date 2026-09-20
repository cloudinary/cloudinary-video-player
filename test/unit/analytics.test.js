import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import videojs from 'video.js';
import VideoPlayer from '../../src/video-player';
import { getResolveVideoElement, extractOptions } from '../../src/video-player.utils';

describe('AnalyticsPlugin', () => {
  let originalFetch;
  let originalGtag;

  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  afterEach(() => {
    window.gtag = originalGtag;
  });

  const createPlayer = async (id) => {
    document.body.innerHTML = `<div><video id="${id}" class="video-js"></video></div>`;
    const elem = getResolveVideoElement(id);
    const options = extractOptions(elem, {
      cloudinaryConfig: { cloud_name: 'demo' },
      analytics: true
    });

    const vp = new VideoPlayer(elem, options);
    await new Promise(resolve => vp.videojs.ready(resolve));
    return vp;
  };

  it('calls gtag when it is callable', async () => {
    originalGtag = window.gtag;
    window.gtag = vi.fn();

    const vp = await createPlayer('test-analytics-gtag-callable');
    vp.videojs.trigger('play');

    expect(window.gtag).toHaveBeenCalledWith('event', 'Play', expect.objectContaining({
      event_category: 'Video'
    }));
  });

  it('does not error when gtag becomes non-callable after init', async () => {
    originalGtag = window.gtag;
    window.gtag = vi.fn();

    const vp = await createPlayer('test-analytics-gtag-noncallable');

    // Simulate a consent-management tool / ad-blocker replacing gtag after setup
    window.gtag = 'not-a-function';

    // videojs's event dispatcher catches handler exceptions and logs them via
    // videojs.log.error instead of letting them throw synchronously, so an
    // uncaught TypeError here surfaces as a logged error, not a thrown one.
    const logErrorSpy = vi.spyOn(videojs.log, 'error').mockImplementation(() => {});

    vp.videojs.trigger('play');

    expect(logErrorSpy).not.toHaveBeenCalled();
  });
});
