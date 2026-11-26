import { defineConfig, devices } from '@playwright/test';

const CI = Boolean(process.env.CI);
// PRs: full set on branded Chrome, `@smoke` on Firefox and WebKit. `E2E_FULL=1`: full set everywhere.
const smokeOnly = process.env.E2E_FULL ? undefined : /@smoke/;
const localPreview = /^http:\/\/(localhost|127\.0\.0\.1)[:/]/.test(process.env.PREVIEW_URL ?? '');
const local = { testDir: 'test/e2e', testIgnore: 'preview/**', use: { baseURL: 'http://localhost:4173' } };

export default defineConfig({
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['html', { open: 'never' }], ['list']],
  use: { trace: 'retain-on-failure' },
  projects: [
    // Branded Chrome plays H.264/AAC, as in v4.
    { name: 'chrome', ...local, use: { ...devices['Desktop Chrome'], channel: 'chrome', ...local.use } },
    { name: 'firefox', ...local, grep: smokeOnly, use: { ...devices['Desktop Firefox'], ...local.use } },
    { name: 'webkit', ...local, grep: smokeOnly, use: { ...devices['Desktop Safari'], ...local.use } },
    // The Netlify deploy preview of this commit (PREVIEW_URL), loaded from another origin.
    {
      name: 'preview',
      testDir: 'test/e2e/preview',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PREVIEW_URL,
        // A dry run against localhost: Chrome blocks a public page from loading loopback files.
        launchOptions: { args: localPreview ? ['--disable-features=LocalNetworkAccessChecks'] : [] },
      },
    },
  ],
  // The built examples site (`npm run build && npm run build:examples`), as Netlify serves it.
  webServer: {
    command: 'npx vite preview --config examples/vite.config.ts',
    url: 'http://localhost:4173/player.html',
    reuseExistingServer: !CI,
  },
});
