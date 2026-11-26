import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

// The built npm entry (`npm run build` first) imports in Node without a DOM (test-plan.md §3).
describe('npm entry', () => {
  it('imports in Node without a DOM', async () => {
    expect(globalThis.document).toBeUndefined();
    await expect(import('../../dist/index.js')).resolves.toBeDefined();
  });

  it('exports the files the package.json exports map names', async () => {
    const { exports } = JSON.parse(await readFile('package.json', 'utf8'));
    const files = [exports['.'].types, exports['.'].default, exports['./cld-video-player.min.css'], exports['./schema.json']];
    await Promise.all(files.map((file: string) => expect(readFile(file)).resolves.toBeDefined()));
  });
});
