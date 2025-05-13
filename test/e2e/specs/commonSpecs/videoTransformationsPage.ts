import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testVideoTransformationsPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to video transformations page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that via source transformation video is playing', async () => {
        await pomPages.videoTransformationsPage.viaSourceVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Validating that via player transformation video is playing', async () => {
        await pomPages.videoTransformationsPage.viaPlayerVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Scroll until data cld transformation video element is visible', async () => {
        await pomPages.videoTransformationsPage.viaDataCldTransformationsVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that via data cld transformation video is playing', async () => {
        await pomPages.videoTransformationsPage.viaDataCldTransformationsVideoComponent.validateVideoIsPlaying(true);
    });
}
