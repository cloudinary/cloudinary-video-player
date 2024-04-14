import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';


export default defineConfig({
  build: {
    rollupOptions: {
      input: fs.readdirSync(resolve(__dirname)).filter(file => file.endsWith('.html'))
    }
  }
});
