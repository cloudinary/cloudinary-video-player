// CDN loader: classic IIFE (`player.min.js`). Works with <script>, defer and async.
import { createShell } from '../shell/index.js';
import type { LayerModule } from '../core/types.js';

// Read at top level: document.currentScript is null inside callbacks.
const script = document.currentScript as HTMLScriptElement;
const base = new URL('.', script.src);
const layerUrl = new URL('./esm/player.js', base).href;

// Native dynamic import from a classic script, with a URL computed at run time.
const shell = createShell(() => import(layerUrl) as Promise<LayerModule>);
shell.defineElement();
(window as unknown as { cloudinary: typeof shell }).cloudinary = shell;
