// CDN entry: classic IIFE (`player.min.js`). The shell (Phase 3) adds the factories and loads the chunks.
import '../shell/shell.css';

const global = window as Window & { cloudinary?: object };
global.cloudinary ??= {};
