import { vpTest } from '../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.Playlist);

vpTest(`Test if 2 videos on playlist page are playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to playlist page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that horizontal playlist video is playing', async () => {
        await pomPages.playlistPage.playlistHorizontalVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Validating that vertical playlist video is playing', async () => {
        await pomPages.playlistPage.playlistVerticalVideoComponent.validateVideoIsPlaying(true);
    });
});
