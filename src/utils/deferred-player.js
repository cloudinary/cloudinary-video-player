/**
 * Deferred Player Proxy
 *
 * Returns a synchronous object from videoPlayer() that buffers all method calls
 * while the real VideoPlayer loads asynchronously, then replays them in order.
 *
 * This allows the default entry point to be lightweight (lazy) while preserving
 * the synchronous API contract:
 *
 *   const player = cloudinary.videoPlayer('el', { ... });
 *   player.source('elephants');       // buffered, replayed after load
 *   player.on('error', handler);      // buffered, replayed after load
 */

/**
 * Creates a deferred player proxy that buffers calls until the real player loads.
 *
 * @param {Promise<Object>} playerPromise - Promise that resolves to a VideoPlayer instance.
 * @returns {Object} A proxy that looks like a VideoPlayer synchronously.
 */
export const createDeferredPlayer = (playerPromise) => {
  let realPlayer = null;
  let failed = false;
  const queue = [];

  const resolvedPromise = playerPromise.then((p) => {
    realPlayer = p;
    queue.forEach(({ method, args, resolve, reject }) => {
      try {
        resolve(realPlayer[method](...args));
      } catch (e) {
        reject(e);
      }
    });
    queue.length = 0;
    return p;
  }).catch((err) => {
    failed = true;
    queue.forEach(({ reject }) => reject(err));
    queue.length = 0;
    throw err;
  });

  const proxy = new Proxy({}, {
    get(_target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return resolvedPromise[prop].bind(resolvedPromise);
      }

      if (prop === Symbol.toPrimitive || prop === Symbol.toStringTag) {
        return undefined;
      }

      if (realPlayer) {
        const val = realPlayer[prop];
        return typeof val === 'function' ? val.bind(realPlayer) : val;
      }

      if (failed) {
        return undefined;
      }

      return (...args) => {
        const deferred = {};
        const promise = new Promise((resolve, reject) => {
          deferred.resolve = resolve;
          deferred.reject = reject;
        });
        queue.push({ method: prop, args, ...deferred });
        promise.catch((e) => console.error('[Cloudinary] Deferred player call failed:', e));
        return proxy;
      };
    },

    has(_target, prop) {
      if (realPlayer) {
        return prop in realPlayer;
      }
      return true;
    }
  });

  return proxy;
};
