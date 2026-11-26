// Fixture shell (stand-in for src/shell/, ≤ 10 KB gzip). Imports only core.
// No import.meta here: this code is also bundled into the IIFE loader.
import { cloudPrefix } from '../core/cloud.js';
import { DEFAULT_SKIN, isSkin } from '../core/options.js';
import type { PlayerOptions } from '../core/options.js';
import type { LoadLayer, PlayerHandle } from '../core/types.js';

/** Public API of the shell. */
export interface Shell {
  videoPlayer(el: HTMLElement, options: PlayerOptions): Promise<PlayerHandle>;
  defineElement(): void;
}

/** Creates the shell around a layer loader. */
export function createShell(loadLayer: LoadLayer): Shell {
  let layer: ReturnType<LoadLayer> | undefined;

  async function videoPlayer(el: HTMLElement, options: PlayerOptions): Promise<PlayerHandle> {
    const skin = isSkin(options.skin) ? options.skin : DEFAULT_SKIN;
    el.dataset.cloud = cloudPrefix(options.cloudName);
    el.classList.add('cld-video-player', `cld-video-player-skin-${skin}`);
    layer ??= loadLayer();
    const { createPlayer } = await layer;
    return createPlayer(el, { ...options, skin });
  }

  function defineElement(): void {
    if (customElements.get('cld-video-player')) return;
    customElements.define('cld-video-player', class extends HTMLElement {
      connectedCallback(): void {
        const features = (this.getAttribute('features') ?? '').split(/\s+/);
        videoPlayer(this, {
          cloudName: this.getAttribute('cloud-name') ?? 'demo',
          publicId: this.getAttribute('public-id') ?? undefined,
          chapters: features.includes('chapters'),
          title: features.includes('title'),
        }).then(
          (handle) => this.dispatchEvent(new CustomEvent('ready', { detail: handle.features })),
          (error: unknown) => this.dispatchEvent(new CustomEvent('error', { detail: String(error) })),
        );
      }
    });
  }

  return { videoPlayer, defineElement };
}
