// Phase 1 check of @tsdown/css `splitting` (S-6 row 2a was "not verified here").
import { defineConfig } from 'tsdown';

export default defineConfig({
  cwd: import.meta.dirname,
  entry: { index: 'src/index.ts' },
  format: 'esm',
  outDir: 'dist',
  platform: 'browser',
  dts: false,
  report: false,
  css: { splitting: true, minify: true },
  outputOptions: { chunkFileNames: 'chunks/[name]-[hash].js' },
});
