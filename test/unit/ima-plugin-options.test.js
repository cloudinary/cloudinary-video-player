import { vi, describe, it, expect, beforeEach } from 'vitest';
import imaPlugin from '~/plugins/ima';

vi.mock('~/plugins/ima/ima', () => ({}));

const createPlayer = () => {
  const player = {
    ads: () => {},
    el: () => ({ id: 'player' }),
    one: vi.fn(),
    on: vi.fn()
  };
  // like videojs-ima: calling player.ima(options) turns player.ima into the controller object
  const imaInit = vi.fn(() => {
    player.ima = { playAdBreak: vi.fn(), initCalls: imaInit.mock.calls };
  });
  player.ima = imaInit;
  player.imaInit = imaInit;
  return player;
};

describe('ima plugin options mapping', () => {
  let originalGoogle;

  beforeEach(() => {
    originalGoogle = global.google;
    global.google = { ima: {} };
    return () => {
      global.google = originalGoogle;
    };
  });

  it('passes the debug option through to player.ima', async () => {
    const player = createPlayer();
    await imaPlugin(player, { ads: { adTagUrl: 'https://example.com/ads', debug: true } });

    expect(player.imaInit).toHaveBeenCalledTimes(1);
    expect(player.imaInit.mock.calls[0][0]).toMatchObject({
      adTagUrl: 'https://example.com/ads',
      debug: true
    });
  });

  it('maps all supported ads options', async () => {
    const player = createPlayer();
    await imaPlugin(player, {
      ads: {
        adTagUrl: 'https://example.com/ads',
        showCountdown: false,
        adLabel: 'Sponsored',
        locale: 'fr',
        prerollTimeout: 1000,
        postrollTimeout: 2000,
        autoPlayAdBreaks: false,
        debug: false
      }
    });

    expect(player.imaInit.mock.calls[0][0]).toMatchObject({
      adTagUrl: 'https://example.com/ads',
      showCountdown: false,
      adLabel: 'Sponsored',
      locale: 'fr',
      prerollTimeout: 1000,
      postrollTimeout: 2000,
      autoPlayAdBreaks: false,
      debug: false
    });
  });

  it('plays an ad break only on the first source by default', async () => {
    const player = createPlayer();
    await imaPlugin(player, { ads: { adTagUrl: 'x', adsInPlaylist: 'first-video' } });
    expect(player.one).toHaveBeenCalledTimes(1);
    expect(player.on).not.toHaveBeenCalled();
  });

  it('plays an ad break on every source when configured', async () => {
    const player = createPlayer();
    await imaPlugin(player, { ads: { adTagUrl: 'x', adsInPlaylist: 'every-video' } });
    expect(player.on).toHaveBeenCalledTimes(1);
    expect(player.one).not.toHaveBeenCalled();
  });
});
