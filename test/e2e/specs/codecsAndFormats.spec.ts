import { vpTest } from '../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.CodecsAndFormats);

vpTest(`Test if 3 videos on codecs and formats page are playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to codecs and formats page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that f_auto video is playing', async () => {
        await pomPages.codecsAndFormatsPage.codecsAndFormatsFAutoVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Validating that AV1 video is playing', async () => {
        await pomPages.codecsAndFormatsPage.codecsAndFormatsAv1VideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Scroll until VP9 video element is visible', async () => {
        await pomPages.codecsAndFormatsPage.codecsAndFormatsVp9VideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that VP9 video is playing', async () => {
        await pomPages.codecsAndFormatsPage.codecsAndFormatsVp9VideoComponent.validateVideoIsPlaying(true);
    });
});
