import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testPlaylistPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
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
}
