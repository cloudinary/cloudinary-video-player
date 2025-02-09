import { vpTest } from '../../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.MultiplePlayers);

vpTest(`Test if 3 videos on multiple players page are playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to multiple players page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that player 1 video is playing', async () => {
        await pomPages.multiplePlayersPage.multiplePlayersPlayer1VideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Validating that player 2 video video is playing', async () => {
        await pomPages.multiplePlayersPage.multiplePlayersPlayer2VideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Scroll until player 3 video element is visible', async () => {
        await pomPages.colorsApiPage.colorsApiLightSkinVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that player 3 video is playing', async () => {
        await pomPages.multiplePlayersPage.multiplePlayersPlayer3VideoComponent.validateVideoIsPlaying(true);
    });
});
