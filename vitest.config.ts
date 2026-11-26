import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Nightly runs all three engines: VITEST_BROWSERS=chromium,firefox,webkit
const browsers = (process.env.VITEST_BROWSERS ?? 'chromium').split(',') as Array<'chromium' | 'firefox' | 'webkit'>;

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'browser',
          include: ['test/browser/**/*.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: browsers.map((browser) => ({ browser })),
          },
        },
      },
    ],
  },
});
