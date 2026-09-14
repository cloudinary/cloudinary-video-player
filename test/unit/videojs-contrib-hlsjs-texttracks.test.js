import { describe, it, expect, vi, beforeEach } from 'vitest';

// Minimal hls.js mock: only what videojs-contrib-hlsjs.js touches at module
// load time and inside Html5HlsJS(). Real hls.js needs MediaSource/browser
// APIs jsdom doesn't provide, and none of that is relevant to this bug -
// the bug is pure Object.defineProperty semantics on the <video> element.
vi.mock('hls.js', () => {
  function Hls() {
    this.on = vi.fn();
    this.attachMedia = vi.fn();
    this.loadSource = vi.fn();
    this.destroy = vi.fn();
    this.recoverMediaError = vi.fn();
    this.swapAudioCodec = vi.fn();
  }
  Hls.isSupported = () => true;
  Hls.Events = {};
  Hls.ErrorTypes = { NETWORK_ERROR: 'networkError', MEDIA_ERROR: 'mediaError' };
  return { default: Hls };
});

/**
 * The module under test has no exports - it registers HlsSourceHandler with
 * window.videojs as a side effect of being imported. We capture that
 * reference through a fake videojs so we can call the *real* handleSource
 * (and therefore the real Html5HlsJS) directly, the same code path video.js
 * calls in the browser.
 */
async function loadRealHlsSourceHandler() {
  let captured = null;
  window.videojs = {
    getTech: (name) => (name === 'Html5' ? { registerSourceHandler: (handler) => { captured = handler; } } : undefined),
  };

  vi.resetModules();
  await import('../../src/plugins/adaptive-streaming/videojs-contrib-hlsjs.js');

  delete window.videojs;
  return captured;
}

function makeTech(el) {
  return {
    options_: {},
    el: () => el,
    featuresNativeTextTracks: false, // Chrome/most non-Safari browsers - the branch that defines `textTracks`
    textTracks: () => [],
    addTextTrack: vi.fn(),
    trigger: vi.fn(),
  };
}

describe('videojs-contrib-hlsjs.js - textTracks redefinition on a second HLS source', () => {
  let HlsSourceHandler;

  beforeEach(async () => {
    HlsSourceHandler = await loadRealHlsSourceHandler();
  });

  it('reproduces the reported bug: setting a second HLS source on the same <video> element throws', () => {
    // Only relevant if the fix under test has been reverted - see README note
    // in the PR / VIDEO-XXXXX for how to flip this locally.
    const el = document.createElement('video');
    const source = { src: 'https://example.com/video.m3u8' };

    // First source (e.g. hls/h265) - defines `textTracks` on the element.
    expect(() => HlsSourceHandler.handleSource(source, makeTech(el))).not.toThrow();

    // Fallback source on the SAME element (e.g. hls/h265 -> hls/h264 after a 400),
    // mirrors what videojs does when swapping sources without recreating the tech.
    expect(() => HlsSourceHandler.handleSource(source, makeTech(el))).not.toThrow();
  });
});
