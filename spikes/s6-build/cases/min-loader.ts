// Mechanism only (no shell): currentScript base + native import() of the layer.
// Built as an IIFE to measure what the loader technique itself costs.
const base = new URL('.', (document.currentScript as HTMLScriptElement).src);
const load = (): Promise<unknown> => import(new URL('./esm/player.js', base).href);
(window as unknown as { cldLoad: typeof load }).cldLoad = load;
