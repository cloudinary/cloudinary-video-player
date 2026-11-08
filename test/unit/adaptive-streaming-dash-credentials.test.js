import { describe, it, expect, vi } from 'vitest';
import 'videojs-contrib-dash';

// Side-effect imports need browser APIs jsdom doesn't provide and aren't relevant here
vi.mock('hls.js', () => ({ default: {} }));
vi.mock('videojs-contrib-quality-levels', () => ({}));
vi.mock('videojs-contrib-quality-menu', () => ({}));
vi.mock('../../src/plugins/adaptive-streaming/videojs-contrib-hlsjs', () => ({}));
vi.mock('../../src/plugins/adaptive-streaming/quality-levels', () => ({
  qualityLevels: () => ({ init: vi.fn() })
}));

import adaptiveStreamingPlugin from '../../src/plugins/adaptive-streaming/adaptive-streaming';

const REQUEST_TYPES = ['MPD', 'InitializationSegment', 'MediaSegment'];

// Runs the plugin, then applies its dash tech options to a real dash.js player
// the way videojs-contrib-dash does: each key is a mediaPlayer method, each value its arguments
const createDashMediaPlayer = async (options) => {
  const player = { tech_: { options_: {} }, on: vi.fn(), qualityMenu: vi.fn() };
  await adaptiveStreamingPlugin(player, { isDash: true, ...options });

  const mediaPlayer = window.dashjs.MediaPlayer().create();
  Object.entries(player.tech_.options_.dash || {}).forEach(([key, args]) => {
    mediaPlayer[key](...args);
  });
  return mediaPlayer;
};

describe('dash.js withCredentials', () => {
  it('sends manifest and segment requests with credentials', async () => {
    const mediaPlayer = await createDashMediaPlayer({ withCredentials: true });
    REQUEST_TYPES.forEach((type) => {
      expect(mediaPlayer.getXHRWithCredentialsForType(type)).toBe(true);
    });
  });

  it('sends requests without credentials by default', async () => {
    const mediaPlayer = await createDashMediaPlayer({ withCredentials: false });
    REQUEST_TYPES.forEach((type) => {
      expect(mediaPlayer.getXHRWithCredentialsForType(type)).toBe(false);
    });
  });
});
