import { vpTest } from '../../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.VisualSearch);

vpTest(`Test if video on visual search page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to visual search page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 10000);
    });

    // Wait for both video elements to be ready
    await test.step('Wait for video elements to be ready', async () => {
        await page.waitForSelector('#player_html5_api', { state: 'visible' });
        await page.waitForSelector('#player-playlist_html5_api', { state: 'visible' });
    });

    await test.step('Click play button on visual search video', async () => {
        await pomPages.visualSearchPage.visualSearchVideoComponent.clickPlay();
    });

    await test.step('Validating that visual search video is playing', async () => {
        await pomPages.visualSearchPage.visualSearchVideoComponent.validateVideoIsPlaying(true);
    });

    await test.step('Click play button on playlist video', async () => {
        await pomPages.visualSearchPage.visualSearchPlaylistVideoComponent.clickPlay();
    });

    await test.step('Validating that visual search playlist video is playing', async () => {
        await pomPages.visualSearchPage.visualSearchPlaylistVideoComponent.validateVideoIsPlaying(true);
    });
});
