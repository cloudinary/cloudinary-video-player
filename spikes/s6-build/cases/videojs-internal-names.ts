// Probe: which Video.js 10.7.0 entry points export the @internal names.
// Type check only; each TS2305 error marks a name that entry point does not export.
// Run: node node_modules/typescript7/bin/tsc -p spikes/s6-build/cases/tsconfig.videojs.json
export type { definePlayerFeature as A1, PlayerExtension as A2, defineSlice as A3 } from '@videojs/core';
export type { definePlayerFeature as B1, PlayerExtension as B2, defineSlice as B3 } from '@videojs/core/dom';
export type { defineSlice as D3 } from '@videojs/store';
export type {
  definePlayerFeature as C1, PlayerExtension as C2, defineSlice as C3,
  extensionContext as C4, mediaContext as C5, createMediaAttachMixin as C6,
} from '@videojs/html';
