// Fixture: the narrow context given to features (features may import only this
// file and core).
import type { PlayerOptions } from '../core/options.js';

/** What a feature gets. */
export interface FeatureContext {
  readonly el: HTMLElement;
  readonly options: PlayerOptions;
}

/** A feature module: `setup` returns its teardown. */
export interface FeatureModule {
  setup(ctx: FeatureContext): Promise<() => void>;
}

/**
 * URL of the CSS file emitted for the chunk that holds `moduleUrl`.
 * css.splitting names it after the JS chunk (`x-HASH.js` → `x-HASH.css`), so
 * a chunk finds its CSS from its own `import.meta.url`, hashed or not.
 */
export function chunkCssUrl(moduleUrl: string): string {
  return moduleUrl.replace(/\.js(?=[?#]|$)/, '.css');
}

/** Adds a stylesheet once and waits for it. */
export function loadCss(href: string): Promise<void> {
  const found = document.querySelector(`link[data-cld-css="${href}"]`);
  if (found) return Promise.resolve();
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.cldCss = href;
  const loaded = new Promise<void>((resolve, reject) => {
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`CSS failed: ${href}`));
  });
  document.head.append(link);
  return loaded;
}
