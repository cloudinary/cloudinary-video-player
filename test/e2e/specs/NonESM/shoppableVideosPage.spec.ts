import { vpTest } from '../../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.ShoppableVideos);

vpTest(`Test if video on shoppable videos page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to shoppable video page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Click on play button of shoppable videos to play video', async () => {
        return pomPages.shoppableVideosPage.shoppableVideosVideoComponent.clickPlay();
    });
    await test.step('Validating that seek thumbnails video is playing', async () => {
        await pomPages.shoppableVideosPage.shoppableVideosVideoComponent.validateVideoIsPlaying(true);
    });
});
