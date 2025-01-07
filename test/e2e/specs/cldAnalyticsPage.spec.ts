import { vpTest } from '../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.CloudinaryAnalytics);

vpTest(`Test if 4 videos on Cloudinary analytics page are playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to Cloudinary analytics page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that Cloudinary analytics video is playing', async () => {
        await pomPages.cldAnalyticsPage.cldAnalyticsVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Validating that Cloudinary analytics ADP video is playing', async () => {
        await pomPages.cldAnalyticsPage.cldAnalyticsAdpVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Scroll until Cloudinary analytics custom data object video element is visible', async () => {
        await pomPages.cldAnalyticsPage.cldAnalyticsCustomDataObjectVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that Cloudinary analytics custom data object video is playing', async () => {
        await pomPages.cldAnalyticsPage.cldAnalyticsCustomDataObjectVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Scroll until Cloudinary analytics custom data function video element is visible', async () => {
        await pomPages.cldAnalyticsPage.cldAnalyticsCustomDataFunctionVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that Cloudinary analytics custom data function video is playing', async () => {
        await pomPages.cldAnalyticsPage.cldAnalyticsCustomDataFunctionVideoComponent.validateVideoIsPlaying(true);
    });
});
