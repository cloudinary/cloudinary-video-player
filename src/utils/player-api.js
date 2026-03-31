import { scheduleBootstrap, shouldUseScheduleBootstrap } from './schedule';
import { lazyBootstrap, shouldUseLazyBootstrap } from './lazy-player';
import { getVideoElement } from './lazy-player';

export const createAsyncPlayer = async (id, playerOptions, ready, createFn) => {
  const mergedOptions = Object.assign({}, playerOptions);
  const videoElement = getVideoElement(id);

  const opts = await (async () => {
    try {
      const { fetchAndMergeConfig } = await import('./fetch-config');
      const fetched = await fetchAndMergeConfig(mergedOptions);
      return Object.assign({}, fetched, mergedOptions);
    } catch {
      return mergedOptions;
    }
  })();

  if (shouldUseScheduleBootstrap(opts)) {
    return scheduleBootstrap(id, opts, ready);
  }

  if (shouldUseLazyBootstrap(opts)) {
    return lazyBootstrap(id, opts, ready);
  }

  return createFn(videoElement, opts, ready);
};

export const createMultiplePlayers = async (selector, playerOptions, ready, playerFn) => {
  const nodeList = document.querySelectorAll(selector);
  return Promise.all([...nodeList].map((node) => playerFn(node, playerOptions, ready)));
};

export const createMultipleSync = (selector, playerOptions, ready, playerFn) => {
  const nodeList = document.querySelectorAll(selector);
  return [...nodeList].map((node) => playerFn(node, playerOptions, ready));
};

export const setupCloudinaryGlobal = (methods) => {
  const cloudinary = {
    ...(window.cloudinary || {}),
    ...methods,
  };
  window.cloudinary = cloudinary;
  return cloudinary;
};
