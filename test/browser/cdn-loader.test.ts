import { expect, it } from 'vitest';

// Phase 1 stub: the loader sets the global (contracts/distribution.md); the shell adds the factories in Phase 3.
it('sets window.cloudinary and keeps an existing one', async () => {
  const existing = { keep: true };
  (window as Window & { cloudinary?: object }).cloudinary = existing;
  await import('../../src/entries/cdn-loader.ts');
  expect((window as Window & { cloudinary?: object }).cloudinary).toBe(existing);
});
