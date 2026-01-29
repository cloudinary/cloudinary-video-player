import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/unit/**/*.test.js'],
    exclude: [
      'test/*.test.js',
      'test/e2e/**/*',
      'node_modules/**/*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'test/',
        'webpack/',
        'dist/',
        'lib/',
        'docs/',
        '*.config.js',
        '.config/'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      'src': path.resolve(process.cwd(), './src'),
      'assets': path.resolve(process.cwd(), './src/assets'),
      'utils': path.resolve(process.cwd(), './src/utils'),
      'components': path.resolve(process.cwd(), './src/components'),
      'plugins': path.resolve(process.cwd(), './src/plugins'),
      'config': path.resolve(process.cwd(), './src/config'),
      'validators': path.resolve(process.cwd(), './src/validators'),
      'extended-events': path.resolve(process.cwd(), './src/extended-events.js'),
      'video-player.const': path.resolve(process.cwd(), './src/video-player.const.js'),
    }
  }
});