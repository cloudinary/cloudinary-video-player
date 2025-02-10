import { vpTest } from '../../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.SeekThumbnails);

vpTest(`Test if video on seek thumbnails page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to seek thumbnails page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that seek thumbnails video is playing', async () => {
        await pomPages.seekThumbnailsPage.seekThumbnailsVideoComponent.validateVideoIsPlaying(true);
    });
});
