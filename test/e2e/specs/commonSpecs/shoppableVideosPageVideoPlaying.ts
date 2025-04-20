import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testShoppableVideosPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to shoppable video page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Click on play button of shoppable videos to play video', async () => {
        return pomPages.shoppableVideosPage.shoppableVideosVideoComponent.clickPlay();
    });
    await test.step('Validating that shoppable video is playing', async () => {
        await pomPages.shoppableVideosPage.shoppableVideosVideoComponent.validateVideoIsPlaying(true);
    });
}
