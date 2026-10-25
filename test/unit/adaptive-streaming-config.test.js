import { describe, it, expect, vi } from 'vitest';

// videojs.browser is frozen, so mock it with a mutable object
const browser = vi.hoisted(() => ({ IS_IOS: false }));
vi.mock('video.js', () => ({ default: { browser } }));

// Side-effect imports need browser APIs jsdom doesn't provide and aren't relevant here
vi.mock('hls.js', () => ({ default: {} }));
vi.mock('videojs-contrib-quality-levels', () => ({}));
vi.mock('videojs-contrib-quality-menu', () => ({}));
vi.mock('../../src/plugins/adaptive-streaming/videojs-contrib-hlsjs', () => ({}));
vi.mock('../../src/plugins/adaptive-streaming/quality-levels', () => ({
  qualityLevels: () => ({ init: vi.fn() })
}));

import adaptiveStreamingPlugin from '../../src/plugins/adaptive-streaming/adaptive-streaming';

const getHlsjsConfig = async (isIOS) => {
  browser.IS_IOS = isIOS;
  const player = { tech_: { options_: {} }, on: vi.fn(), qualityMenu: vi.fn() };
  await adaptiveStreamingPlugin(player, { strategy: 'highQuality' });
  return player.tech_.options_.hlsjsConfig;
};

describe('adaptive streaming hls.js config', () => {
  it('disables MediaCapabilities and caps on FPS drop on iOS', async () => {
    const config = await getHlsjsConfig(true);
    expect(config.useMediaCapabilities).toBe(false);
    expect(config.capLevelOnFPSDrop).toBe(true);
  });

  it('keeps hls.js defaults on other platforms', async () => {
    const config = await getHlsjsConfig(false);
    expect(config.useMediaCapabilities).toBe(true);
    expect(config.capLevelOnFPSDrop).toBe(false);
  });

  it('keeps the selected strategy settings', async () => {
    const config = await getHlsjsConfig(true);
    expect(config.capLevelToPlayerSize).toBe(true);
    expect(config.ignoreDevicePixelRatio).toBe(false);
  });
});
