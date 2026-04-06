import { expect } from '@playwright/test';
import { vpTest } from '../../fixtures/vpTest';
import { ESM_URL } from '../../testData/esmUrl';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';

const link = getEsmLinkByName(ExampleLinkName.LazyPlayer);

vpTest('Given lazy-player page, when load button clicked, then player loads on demand', async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await pomPages.mainPage.clickLinkByName(link.name);
    await waitForPageToLoadWithTimeout(page, 5000);

    const overlay = page.locator('.cld-lazy-player');
    await expect(overlay.first()).toBeVisible({ timeout: 5000 });

    await page.locator('#btn-load').click();

    await expect(page.locator('#player.video-js')).toBeVisible({ timeout: 10000 });
    await expect(overlay).toHaveCount(1, { timeout: 5000 });
});
