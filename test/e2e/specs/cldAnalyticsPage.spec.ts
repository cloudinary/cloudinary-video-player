import { vpTest } from '../fixtures/vpTest';
import { expect, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.CloudinaryAnalytics);

vpTest(`Test if 4 videos on Cloudinary analytics page are playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to Cloudinary analytics page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that the first video is playing (in case isPause is false)', async () => {
        expect(await pomPages.cldAnalyticsPage.cldAnalyticsVideoComponent.validateVideoPaused(false));
    });
    await test.step('Validating that the second video is playing (in case isPause is false)', async () => {
        expect(await pomPages.cldAnalyticsPage.cldAnalyticsAdpVideoComponent.validateVideoPaused(false));
    });
    await test.step('Scroll until the third video element is visible', async () => {
        await pomPages.cldAnalyticsPage.cldAnalyticsCustomDataObjectVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that the third video is playing (in case isPause is false)', async () => {
        await expect(async () => {
            expect(await pomPages.cldAnalyticsPage.cldAnalyticsCustomDataObjectVideoComponent.validateVideoPaused(false));
        }).toPass({ intervals: [500], timeout: 3000 });
    });
    await test.step('Scroll until the fourth video element is visible', async () => {
        await pomPages.cldAnalyticsPage.cldAnalyticsCustomDataFunctionVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that the fourth video is playing (in case isPause is false)', async () => {
        await expect(async () => {
            expect(await pomPages.cldAnalyticsPage.cldAnalyticsCustomDataFunctionVideoComponent.validateVideoPaused(false));
        }).toPass({ intervals: [500], timeout: 3000 });
    });
});
