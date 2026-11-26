// Runs a v4 Vitest config and fails only when a test fails.
// The exit code alone is not used: Vitest also exits 1 when a parent folder has a broken package.json.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const runV4Vitest = (configUrl) => {
  const dir = mkdtempSync(join(tmpdir(), 'v4-vitest-'));
  const report = join(dir, 'report.json');
  try {
    spawnSync('npx', ['vitest', 'run', '--config', new URL(configUrl).pathname, '--reporter=default', '--reporter=json', `--outputFile.json=${report}`], { stdio: 'inherit' });
    const { numTotalTests, numPassedTests } = JSON.parse(readFileSync(report, 'utf8'));
    if (numTotalTests === 0 || numPassedTests !== numTotalTests) {
      throw new Error(`${numPassedTests}/${numTotalTests} recorder tests passed`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};
