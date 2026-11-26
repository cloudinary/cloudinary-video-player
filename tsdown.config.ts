import { defineConfig, type UserConfig } from 'tsdown';

// Browser floor (plan.md): Safari/iOS 16.4, Chrome/Edge 111, Firefox 121.
const target = ['chrome111', 'firefox121', 'safari16.4'];

const common: UserConfig = {
  tsconfig: 'tsconfig.build.json',
  platform: 'browser',
  target,
  minify: true,
  report: false,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
};

export default defineConfig([
  {
    ...common,
    name: 'esm',
    entry: { index: 'src/entries/index.ts' },
    format: 'esm',
    outDir: 'dist',
    clean: true,
    dts: true,
    // One CSS file per lazy chunk, named after the chunk (@tsdown/css).
    css: { splitting: true, minify: true },
    outputOptions: { chunkFileNames: 'chunks/[name]-[hash].js' },
  },
  {
    ...common,
    name: 'cdn',
    entry: { 'player.min': 'src/entries/cdn-loader.ts' },
    format: 'iife',
    outDir: 'dist',
    clean: false,
    dts: false,
    css: { fileName: 'player.min.css', minify: true },
    outputOptions: { entryFileNames: '[name].js' },
  },
]);
