// Lint case: namespace import, then an @internal name through it.
import * as vjs from '@videojs/html';
export const ctx = vjs.mediaContext;
