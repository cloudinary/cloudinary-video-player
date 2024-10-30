import { ConsoleMessage, test } from '@playwright/test';
import { MainPage } from '../src/pom/mainPage';

/**
 * Fixture parameters.
 */
type FixtureParams = {
    consoleErrors: ConsoleMessage[];
    vpExamples: MainPage;
};

/**
 * Extend Playwright test with custom fixtures.
 */
export const vpTest = test.extend<FixtureParams>({
    /**
     * Fixture for the video player examples page object.
     */
    vpExamples: [
        async ({ page }, use) => {
            const vpExamplePage = new MainPage(page);
            // await vpExamplePage.goto();
            await use(vpExamplePage);
        },
        { auto: true },
    ],

    /**
     * Fixture for capturing console errors.
     */
    consoleErrors: [
        async ({ page }, use) => {
            const consoleLogs = new Array<ConsoleMessage>();
            page.on('console', (msg) => {
                if (msg.type() === 'error') consoleLogs.push(msg);
            });
            await use(consoleLogs);
        },
        { scope: 'test' },
    ],
});
