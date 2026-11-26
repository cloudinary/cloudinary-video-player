// Fixture feature chunk. Imports only core and player/context (ring rule).
import './chapters.css';
import { cloudPrefix } from '../../core/cloud.js';
import { chunkCssUrl, loadCss } from '../../player/context.js';
import type { FeatureContext } from '../../player/context.js';

/** Adds the chapters UI. */
export async function setup(ctx: FeatureContext): Promise<() => void> {
  await loadCss(chunkCssUrl(import.meta.url));
  const node = document.createElement('div');
  node.className = 'cld-chapters';
  node.textContent = `chapters from ${cloudPrefix(ctx.options.cloudName)}`;
  ctx.el.append(node);
  return () => node.remove();
}
