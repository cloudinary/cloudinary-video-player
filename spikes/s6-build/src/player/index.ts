// Fixture layer (`esm/player.js`, unhashed ESM entry). The CDN loader imports
// it by URL; the npm entry imports it through the bundler.
import { cloudPrefix } from '../core/cloud.js';
import type { PlayerOptions } from '../core/options.js';
import type { PlayerHandle } from '../core/types.js';
import { FEATURES } from './features.js';

/** Builds one player and loads the features its options ask for. */
export async function createPlayer(el: HTMLElement, options: PlayerOptions): Promise<PlayerHandle> {
  const video = document.createElement('video');
  video.dataset.src = `${cloudPrefix(options.cloudName)}/video/upload/${options.publicId ?? ''}`;
  el.append(video);
  const names: string[] = [];
  const teardowns: Array<() => void> = [];
  for (const [name, load] of Object.entries(FEATURES)) {
    const pending = load(options);
    if (!pending) continue;
    const feature = await pending;
    teardowns.push(await feature.setup({ el, options }));
    names.push(name);
  }
  return {
    features: names,
    dispose: () => teardowns.forEach((teardown) => teardown()),
  };
}
