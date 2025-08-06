import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testSharePluginPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to share & download page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that share & download player 1 is playing', async () => {
        await pomPages.sharePluginPage.sharePluginPlayer1VideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Validating that share & download player 2 is playing', async () => {
        await pomPages.sharePluginPage.sharePluginPlayer2VideoComponent.validateVideoIsPlaying(true);
    });
}
