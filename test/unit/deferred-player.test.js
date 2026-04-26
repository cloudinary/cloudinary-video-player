import { createDeferredPlayer } from '../../src/utils/deferred-player';

const createMockPlayer = (overrides = {}) => ({
  source: vi.fn().mockReturnValue('source-result'),
  on: vi.fn().mockReturnValue('on-result'),
  one: vi.fn(),
  off: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  playlist: vi.fn().mockReturnValue('playlist-result'),
  dispose: vi.fn(),
  duration: vi.fn().mockReturnValue(120),
  currentPublicId: vi.fn().mockReturnValue('my-video'),
  videojs: { vr: vi.fn() },
  ...overrides
});

describe('deferred-player', () => {
  describe('basic proxy behavior', () => {
    it('returns a proxy synchronously', () => {
      const proxy = createDeferredPlayer(new Promise(() => {}));
      expect(proxy).toBeDefined();
      expect(typeof proxy).toBe('object');
    });

    it('delegates to real player after resolution', async () => {
      const mockPlayer = createMockPlayer();
      const proxy = createDeferredPlayer(Promise.resolve(mockPlayer));

      await proxy;

      proxy.source('elephants');
      expect(mockPlayer.source).toHaveBeenCalledWith('elephants');
    });

    it('returns real method return values after resolution', async () => {
      const mockPlayer = createMockPlayer();
      const proxy = createDeferredPlayer(Promise.resolve(mockPlayer));

      await proxy;

      const result = proxy.duration();
      expect(result).toBe(120);
    });
  });

  describe('call buffering', () => {
    it('buffers method calls before player is ready', async () => {
      let resolve;
      const promise = new Promise((r) => { resolve = r; });
      const mockPlayer = createMockPlayer();
      const proxy = createDeferredPlayer(promise);

      proxy.source('elephants');
      proxy.on('error', () => {});
      proxy.playlist([{ publicId: 'a' }]);

      expect(mockPlayer.source).not.toHaveBeenCalled();
      expect(mockPlayer.on).not.toHaveBeenCalled();
      expect(mockPlayer.playlist).not.toHaveBeenCalled();

      resolve(mockPlayer);
      await promise;

      expect(mockPlayer.source).toHaveBeenCalledWith('elephants');
      expect(mockPlayer.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockPlayer.playlist).toHaveBeenCalledWith([{ publicId: 'a' }]);
    });

    it('replays buffered calls in order', async () => {
      const callOrder = [];
      const mockPlayer = createMockPlayer({
        source: vi.fn(() => callOrder.push('source')),
        on: vi.fn(() => callOrder.push('on')),
        play: vi.fn(() => callOrder.push('play'))
      });

      let resolve;
      const promise = new Promise((r) => { resolve = r; });
      const proxy = createDeferredPlayer(promise);

      proxy.source('video1');
      proxy.on('ready', () => {});
      proxy.play();

      resolve(mockPlayer);
      await promise;

      expect(callOrder).toEqual(['source', 'on', 'play']);
    });

    it('returns proxy for chaining before resolution', () => {
      const proxy = createDeferredPlayer(new Promise(() => {}));

      const result = proxy.source('elephants');
      expect(result).toBe(proxy);
    });
  });

  describe('thenable behavior', () => {
    it('is thenable - resolves to the real player', async () => {
      const mockPlayer = createMockPlayer();
      const proxy = createDeferredPlayer(Promise.resolve(mockPlayer));

      const result = await proxy;
      expect(result).toBe(mockPlayer);
    });

    it('supports .then() chaining', async () => {
      const mockPlayer = createMockPlayer();
      const proxy = createDeferredPlayer(Promise.resolve(mockPlayer));

      const id = await proxy.then((p) => p.currentPublicId());
      expect(id).toBe('my-video');
    });

    it('supports .catch() on failure', async () => {
      const error = new Error('load failed');
      const proxy = createDeferredPlayer(Promise.reject(error));

      const caught = await proxy.catch((e) => e);
      expect(caught).toBe(error);
    });
  });

  describe('property access', () => {
    it('accesses real properties after resolution', async () => {
      const mockPlayer = createMockPlayer();
      const proxy = createDeferredPlayer(Promise.resolve(mockPlayer));

      await proxy;

      expect(proxy.videojs).toBe(mockPlayer.videojs);
    });

    it('has() returns true before resolution for any prop', () => {
      const proxy = createDeferredPlayer(new Promise(() => {}));
      expect('source' in proxy).toBe(true);
      expect('anything' in proxy).toBe(true);
    });

    it('has() delegates to real player after resolution', async () => {
      const mockPlayer = createMockPlayer();
      const proxy = createDeferredPlayer(Promise.resolve(mockPlayer));

      await proxy;

      expect('source' in proxy).toBe(true);
      expect('nonExistentMethod' in proxy).toBe(false);
    });
  });

  describe('error handling', () => {
    it('rejects buffered calls when player fails to load', async () => {
      const error = new Error('load failed');
      const proxy = createDeferredPlayer(Promise.reject(error));

      proxy.source('elephants');

      await proxy.catch(() => {});

      expect(proxy.source).toBeUndefined();
    });

    it('returns undefined for property access after failure', async () => {
      const error = new Error('load failed');
      const proxy = createDeferredPlayer(Promise.reject(error));

      await proxy.catch(() => {});

      expect(proxy.anything).toBeUndefined();
    });
  });
});
