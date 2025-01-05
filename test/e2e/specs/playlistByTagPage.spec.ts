import { vpTest } from '../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.PlaylistByTag);

vpTest.only(`Test if video on playlist by tag page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to playlist by tag page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that playlist by tag video is playing', async () => {
        await pomPages.playlistByTagPage.playlistByTagVideoComponent.validateVideoIsPlaying(true);
    });
});
