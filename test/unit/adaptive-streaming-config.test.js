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

const getTechOptions = async (options, techOptions = {}) => {
  const player = { tech_: { options_: techOptions }, on: vi.fn(), qualityMenu: vi.fn() };
  await adaptiveStreamingPlugin(player, { strategy: 'highQuality', ...options });
  return player.tech_.options_;
};

const getHlsjsConfig = async (isIOS) => {
  browser.IS_IOS = isIOS;
  return (await getTechOptions()).hlsjsConfig;
};

describe('adaptive streaming hls.js config', () => {
  it('disables MediaCapabilities and caps on FPS drop on iOS', async () => {
    const config = await getHlsjsConfig(true);
    expect(config.useMediaCapabilities).toBe(false);
    expect(config.capLevelOnFPSDrop).toBe(true);
  });

  it('keeps hls.js defaults on other platforms', async () => {
    const config = await getHlsjsConfig(false);
    expect(config).not.toHaveProperty('useMediaCapabilities');
    expect(config).not.toHaveProperty('capLevelOnFPSDrop');
  });

  it('keeps the selected strategy settings', async () => {
    const config = await getHlsjsConfig(true);
    expect(config.capLevelToPlayerSize).toBe(true);
    expect(config.ignoreDevicePixelRatio).toBe(false);
  });
});

describe('adaptive streaming withCredentials', () => {
  describe('hls.js', () => {
    it('sends xhr requests with credentials', async () => {
      const { hlsjsConfig } = await getTechOptions({ withCredentials: true });
      const xhr = { withCredentials: false };
      hlsjsConfig.xhrSetup(xhr);
      expect(xhr.withCredentials).toBe(true);
    });

    it('leaves xhr requests alone without withCredentials', async () => {
      const { hlsjsConfig } = await getTechOptions({ withCredentials: false });
      expect(hlsjsConfig).not.toHaveProperty('xhrSetup');
    });
  });

  describe('dash.js', () => {
    it('enables credentials for every request type', async () => {
      const { dash } = await getTechOptions({ withCredentials: true, isDash: true });
      expect(dash.setXHRWithCredentialsForType).toEqual([undefined, true]);
    });

    it('keeps dash options passed by the user', async () => {
      const { dash } = await getTechOptions(
        { withCredentials: true, isDash: true },
        { dash: { setLogLevel: 0 } }
      );
      expect(dash.setLogLevel).toBe(0);
      expect(dash.setXHRWithCredentialsForType).toEqual([undefined, true]);
    });

    it('sets no dash options without withCredentials', async () => {
      const techOptions = await getTechOptions({ withCredentials: false, isDash: true });
      expect(techOptions).not.toHaveProperty('dash');
    });
  });
});
