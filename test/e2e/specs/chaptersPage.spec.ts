import { vpTest } from '../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.Chapters);

vpTest(`Test if 3 videos on chapters page are playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to chapters page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that chapters vtt file video is playing', async () => {
        await pomPages.chaptersPage.chaptersVttFIleVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Validating that chapters config object video is playing', async () => {
        await pomPages.chaptersPage.chaptersConfigObjectVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Scroll until chapters auto vtt file video element is visible', async () => {
        await pomPages.chaptersPage.chapterAutoVttFileVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that chapters auto vtt file video is playing', async () => {
        await pomPages.chaptersPage.chapterAutoVttFileVideoComponent.validateVideoIsPlaying(true);
    });
});
