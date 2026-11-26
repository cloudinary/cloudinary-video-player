// S-6: one tsdown config, two builds (ESM for npm + IIFE CDN loader).
import { defineConfig } from 'tsdown';
import type { UserConfig } from 'tsdown';
import { cssSplit } from './css-split-plugin.mjs';

const here = import.meta.dirname;
// Plan floor: Safari/iOS 16.4, Chrome 111, Firefox 121.
const target = ['chrome111', 'firefox121', 'safari16.4'];

const common: UserConfig = {
  cwd: here,
  tsconfig: 'tsconfig.json',
  platform: 'browser',
  target,
  minify: true,
  clean: false,
  report: false,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
};

export default defineConfig([
  {
    ...common,
    name: 'esm',
    entry: { index: 'src/entries/index.ts', player: 'src/player/index.ts' },
    format: 'esm',
    outDir: 'dist/esm',
    dts: true,
    // @tsdown/css is not installed: use the own plugin (would be `css: { splitting: true, minify: true }`).
    css: false,
    plugins: [cssSplit()],
    // Defaults kept: entries `[name].js` (unhashed `esm/player.js`), chunks
    // `[name]-[hash].js`; an `index.ts` chunk is named after its folder.
  },
  {
    ...common,
    name: 'cdn',
    entry: { 'player.min': 'src/entries/cdn-loader.ts' },
    format: 'iife',
    outDir: 'dist',
    dts: false,
    // tsdown names IIFE output `[name].iife.js` by default.
    outputOptions: { entryFileNames: '[name].js' },
  },
]);
