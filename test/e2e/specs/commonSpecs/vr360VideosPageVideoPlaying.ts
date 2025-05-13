import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testVr360PageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to VR 360 videos page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Click on play button of 360 video play video', async () => {
        return pomPages.vr360VideosPage.vr360VideoComponent.clickPlay();
    });
    await test.step('Validating that 360 video is playing', async () => {
        await pomPages.vr360VideosPage.vr360VideoComponent.validateVideoIsPlaying(true, 6000);
    });
}
