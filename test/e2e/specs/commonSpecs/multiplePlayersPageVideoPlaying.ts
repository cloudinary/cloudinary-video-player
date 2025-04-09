import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testMultiplePlayersPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
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
}
