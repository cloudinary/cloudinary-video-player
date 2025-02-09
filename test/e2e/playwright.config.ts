import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    timeout: 150000,
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: 5,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [['list'], ['html', { open: 'never' }]],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        headless: true,
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'Setup esm deploy url',
            testMatch: 'test/Setup/global.setup.ts',
        },
        {
            name: 'ESM',
            testMatch: 'test/e2e/specs/ESM/**/*.spec.ts',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'chrome',
            },
            dependencies: ['Setup esm deploy url'],
        },
        {
            name: 'Non ESM',
            testMatch: 'test/e2e/specs/NonESM/**/*.spec.ts',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'chrome',
            },
        },
    ],

    //!* Run your local dev server before starting the tests *!
    webServer: {
        command: 'npm run start',
        url: 'http://localhost:3000/index.html',
        reuseExistingServer: !process.env.CI,
    },
});
