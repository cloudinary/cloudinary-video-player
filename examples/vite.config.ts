import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = import.meta.dirname;
const repo = resolve(root, '..');

// `npm run dev` imports the package from `src/`; `build:examples` from the built `dist/`.
// The built `dist/` is the public folder: `?delivery=cdn` loads `/player.min.js` like a customer page.
export default defineConfig(({ command }) => ({
  root,
  publicDir: resolve(repo, 'dist'),
  resolve: {
    alias: [
      {
        find: /^cloudinary-video-player$/,
        replacement: resolve(repo, command === 'serve' ? 'src/entries/index.ts' : 'dist/index.js'),
      },
      {
        find: /^cloudinary-video-player\/cld-video-player\.min\.css$/,
        replacement: resolve(repo, command === 'serve' ? 'src/shell/shell.css' : 'dist/cld-video-player.min.css'),
      },
    ],
  },
  build: {
    outDir: resolve(root, 'dist'),
    emptyOutDir: true,
    target: ['chrome111', 'firefox121', 'safari16.4'],
    rolldownOptions: {
      input: { index: resolve(root, 'index.html'), player: resolve(root, 'player.html') },
    },
  },
  preview: { port: 4173, strictPort: true },
}));
