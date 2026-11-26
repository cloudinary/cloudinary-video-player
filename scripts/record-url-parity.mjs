#!/usr/bin/env node
// Records the v4 URL-parity fixtures (SC-002, T002) into test/fixtures/url-parity/.
//
// Needs the v4 tree: run it on `master`, or on a `v5` commit before T013 deletes
// the v4 source. It drives the real v4 code (VideoSource and the full VideoPlayer
// in jsdom) through the v4 Vitest setup; no URL is typed by hand.
//
//   npm ci && node scripts/record-url-parity.mjs
import { runV4Vitest } from './run-v4-vitest.mjs';

runV4Vitest(new URL('./url-parity/vitest.config.mjs', import.meta.url));
