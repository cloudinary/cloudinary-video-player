// Fixture: contracts between the rings. Types only.
import type { PlayerOptions } from './options.js';

/** What the layer returns for one player. */
export interface PlayerHandle {
  /** Feature names that finished setup. */
  readonly features: readonly string[];
  dispose(): void;
}

/** The layer module (`esm/player.js`) as the shell sees it. */
export interface LayerModule {
  createPlayer(el: HTMLElement, options: PlayerOptions): Promise<PlayerHandle>;
}

/** How the shell gets the layer: npm passes a bundler import, the CDN loader a computed URL. */
export type LoadLayer = () => Promise<LayerModule>;
