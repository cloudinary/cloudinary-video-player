import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.Analytics);

vpTest(`Test if video on ESM analytics page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to ESM', async () => {
        await page.goto(ESM_URL);
    });
    await test.step('Navigate to analytics page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Click on play button of video player to play video', async () => {
        return pomPages.analyticsPage.analyticsVideoComponent.clickPlay();
    });
    await test.step('Validating that the video is playing', async () => {
        await pomPages.analyticsPage.analyticsVideoComponent.validateVideoIsPlaying(true);
    });
});
