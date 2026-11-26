// Fixture: option → lazy feature module map (one chunk per feature).
import type { PlayerOptions } from '../core/options.js';
import type { FeatureModule } from './context.js';

/** Lazy loaders, keyed by option name. */
export const FEATURES: Record<string, (options: PlayerOptions) => Promise<FeatureModule> | undefined> = {
  chapters: (options) => (options.chapters ? import('../features/chapters/index.js') : undefined),
  title: (options) => (options.title ? import('../features/title/index.js') : undefined),
};
