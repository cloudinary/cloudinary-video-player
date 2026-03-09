import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testAspectRatioCropPageVideoIsPlaying(
    page: Page,
    pomPages: PageManager,
    link: ExampleLinkType
) {
    await test.step('Navigate to aspect ratio & crop page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Click play button', async () => {
        await pomPages.aspectRatioCropPage.videoComponent.clickPlay();
    });
    await test.step('Validating that video is playing', async () => {
        await pomPages.aspectRatioCropPage.videoComponent.validateVideoIsPlaying(true);
    });
}
