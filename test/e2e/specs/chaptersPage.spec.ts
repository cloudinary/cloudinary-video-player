import { vpTest } from '../fixtures/vpTest';
import { expect, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

// Link to chapters page
const link = getLinkByName(ExampleLinkName.Chapters);
/**
 * Testing if videos on chapters are playing by checking that is pause return false.
 */
vpTest.only(`Test if 3 videos on chapters page are playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to chapters page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that the first video is playing (in case isPause is false)', async () => {
        expect(await pomPages.chaptersPage.chaptersVttFIleVideoComponent.isPaused()).toEqual(false);
    });
    await test.step('Validating that the second video is playing (in case isPause is false)', async () => {
        expect(await pomPages.chaptersPage.chaptersConfigObjectVideoComponent.isPaused()).toEqual(false);
    });
    await test.step('Click on play button of third video player to play video', async () => {
        return pomPages.chaptersPage.chapterAutoVttFileVideoComponent.clickPlay();
    });
    await test.step('Validating that the third video is playing (in case isPause is false)', async () => {
        expect(await pomPages.chaptersPage.chapterAutoVttFileVideoComponent.isPaused()).toEqual(false);
    });
});
