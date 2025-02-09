import { ExampleLinkType } from './types/exampleLinkType';
import { chromium, expect, Page } from '@playwright/test';
import { ExampleLinkName } from './testData/ExampleLinkNames';
import { ESM_URL } from './testData/esmUrl';

async function globalSetup() {
    if (process.env.PREVIEW_URL) {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        const link: ExampleLinkType = {
            name: ExampleLinkName.AdaptiveStreaming,
            endpoint: 'adaptive-streaming',
        };
        await waitForDeployPreviewUrl(link, page);
        await browser.close();
    }
}

/**
 * Waits for a deploy preview URL to become available by making repeated requests and check that link is visible.
 */
async function waitForDeployPreviewUrl(link: ExampleLinkType, page: Page): Promise<void> {
    await expect(async () => {
        await page.goto(ESM_URL);
        const linkLocator = page.getByRole('link', { name: link.name, exact: true });
        await expect(linkLocator).toBeVisible({ timeout: 10000 });
    }).toPass({ intervals: [1_000], timeout: 120000 });
}
export default globalSetup;
