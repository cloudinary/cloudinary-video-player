// Records the v4 player defaults (src/config/defaults.js) into test/fixtures/v4-configs/.
// Run through scripts/collect-v4-configs.mjs (needs the v4 tree, see there).
import { mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import defaults from '../../src/config/defaults';

const serialize = (value) => JSON.parse(JSON.stringify(value, (key, item) => (typeof item === 'function' ? '[Function]' : item)));

describe('record v4 defaults', () => {
  it('writes v4-defaults.json', () => {
    mkdirSync('test/fixtures/v4-configs', { recursive: true });
    const fixture = {
      source: 'src/config/defaults.js',
      commit: execSync('git merge-base HEAD origin/master').toString().trim().slice(0, 8),
      environment: 'jsdom (videojs.browser.IS_IOS is false, so playsinline is false here)',
      defaults: serialize(defaults)
    };
    writeFileSync('test/fixtures/v4-configs/v4-defaults.json', `${JSON.stringify(fixture, null, 2)}\n`);
  });
});
