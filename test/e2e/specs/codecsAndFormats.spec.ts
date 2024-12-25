import { vpTest } from '../fixtures/vpTest';
import { expect, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.CodecsAndFormats);

vpTest(`Test if 3 videos on codecs and formats page are playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to codecs and formats page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that the first video is playing (in case isPause is false)', async () => {
        expect(await pomPages.codecsAndFormatsPage.codecsAndFormatsFAutoVideoComponent.validateVideoPaused(false));
    });
    await test.step('Validating that the second video is playing (in case isPause is false)', async () => {
        expect(await pomPages.codecsAndFormatsPage.codecsAndFormatsAv1VideoComponent.validateVideoPaused(false));
    });
    await test.step('Scroll until the third video element is visible', async () => {
        await pomPages.codecsAndFormatsPage.codecsAndFormatsVp9VideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that the third video is playing (in case isPause is false)', async () => {
        await expect(async () => {
            expect(await pomPages.codecsAndFormatsPage.codecsAndFormatsVp9VideoComponent.validateVideoPaused(false));
        }).toPass({ intervals: [500], timeout: 3000 });
    });
});
