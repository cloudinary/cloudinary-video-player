// npm entry ("."): the bundler resolves the layer import.
import { createShell } from '../shell/index.js';
import type { Shell } from '../shell/index.js';

export type { PlayerOptions, Skin, AutoplayMode } from '../core/options.js';
export type { Shell } from '../shell/index.js';

/** The shell with a bundler-resolved layer loader. */
export const cloudinary: Shell = createShell(() => import('../player/index.js'));
