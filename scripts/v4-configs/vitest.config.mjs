import { mergeConfig } from 'vitest/config';
import v4Config from '../../.config/vitest.config.ts';

const config = mergeConfig(v4Config, {});
config.test.include = ['scripts/v4-configs/defaults.test.js'];
export default config;
