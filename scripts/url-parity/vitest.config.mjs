// The v4 unit-test setup (jsdom, path aliases), limited to the URL-parity recorder.
import { mergeConfig } from 'vitest/config';
import v4Config from '../../.config/vitest.config.ts';

const config = mergeConfig(v4Config, {});
config.test.include = ['scripts/url-parity/record.test.js'];

export default config;
