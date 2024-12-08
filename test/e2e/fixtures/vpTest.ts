import { ConsoleMessage, test } from '@playwright/test';
import { MainPage } from '../src/pom/mainPage';
import PageManager from '../src/pom/PageManager';

/**
 * Fixture parameters.
 */
type FixtureParams = {
    consoleErrors: ConsoleMessage[];
    vpExamples: MainPage;
    pomPages: PageManager;
};

/**
 * Extend Playwright test with custom fixtures.
 */
export const vpTest = test.extend<FixtureParams>({
    /**
     * Page Manager
     */
    pomPages: [
        async ({ page }, use) => {
            const pomPages = new PageManager(page);
            await pomPages.mainPage.goto();
            await use(pomPages);
        },
        { scope: 'test', auto: true },
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
