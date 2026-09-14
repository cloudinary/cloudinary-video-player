import { vi, describe, it, expect, beforeEach } from 'vitest';
import imaPlugin from '~/plugins/ima';

vi.mock('~/plugins/ima/ima', () => ({}));

const createPlayer = () => {
  const listeners = {};
  const player = {
    ads: () => {},
    el: () => ({ id: 'player' }),
    one: vi.fn((event, handler) => {
      (listeners[event] = listeners[event] || []).push({ handler, once: true });
    }),
    on: vi.fn((event, handler) => {
      (listeners[event] = listeners[event] || []).push({ handler, once: false });
    }),
    off: vi.fn((event, handler) => {
      listeners[event] = (listeners[event] || []).filter((l) => l.handler !== handler);
    }),
    trigger: vi.fn((event) => {
      const current = listeners[event] || [];
      listeners[event] = current.filter((l) => !l.once);
      current.forEach((l) => l.handler());
    })
  };
  // like videojs-ima: calling player.ima(options) turns player.ima into the controller object
  const imaInit = vi.fn(() => {
    player.ima = { playAdBreak: vi.fn(), initCalls: imaInit.mock.calls };
  });
  player.ima = imaInit;
  player.imaInit = imaInit;
  return player;
};

const callsFor = (mockFn, event) => mockFn.mock.calls.filter(([e]) => e === event);

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
    expect(callsFor(player.one, 'sourcechanged')).toHaveLength(1);
    expect(callsFor(player.on, 'sourcechanged')).toHaveLength(0);
  });

  it('plays an ad break on every source when configured', async () => {
    const player = createPlayer();
    await imaPlugin(player, { ads: { adTagUrl: 'x', adsInPlaylist: 'every-video' } });
    expect(callsFor(player.on, 'sourcechanged')).toHaveLength(1);
    expect(callsFor(player.one, 'sourcechanged')).toHaveLength(0);
  });

  it('replays a loadstart that fired before initialization completed', async () => {
    const player = createPlayer();
    const pending = imaPlugin(player, { ads: { adTagUrl: 'x' } });
    // loadstart fires while the ima chunk is still loading
    player.trigger('loadstart');
    player.trigger.mockClear();
    await pending;

    expect(player.imaInit).toHaveBeenCalledTimes(1);
    expect(callsFor(player.trigger, 'loadstart')).toHaveLength(1);
  });

  it('does not replay loadstart when none was missed', async () => {
    const player = createPlayer();
    await imaPlugin(player, { ads: { adTagUrl: 'x' } });

    expect(callsFor(player.trigger, 'loadstart')).toHaveLength(0);
    // the recorder listener is removed so a later loadstart is untouched
    player.trigger('loadstart');
    expect(callsFor(player.trigger, 'loadstart')).toHaveLength(1);
  });
});
