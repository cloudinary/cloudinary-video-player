import { ExampleLinkType } from '../../types/exampleLinkType';
import { expect, Page, test } from '@playwright/test';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { ESM_URL } from '../../testData/esmUrl';


/**
 * Ensures the esm deploy is ready by checking the 'Adaptive Streaming' link is visible at ESM_URL.
 */
test('Global Setup', async ({ page }) => {
    test.slow();
    if (ESM_URL) {
        const link: ExampleLinkType = {
            name: ExampleLinkName.AdaptiveStreaming,
            endpoint: 'adaptive-streaming',
        };
        await waitForDeployPreviewUrl(link, page);
    }
});

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

