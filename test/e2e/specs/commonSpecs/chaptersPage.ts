import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testChaptersPageVideosArePlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
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
}
