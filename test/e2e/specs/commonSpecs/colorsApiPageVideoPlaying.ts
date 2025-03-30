import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testColorsApiPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to colors API page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that modified color video is playing', async () => {
        await pomPages.colorsApiPage.colorsApiColorSkinVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Validating that dark skin video video is playing', async () => {
        await pomPages.colorsApiPage.colorsApiDarkSkinVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Scroll until light skin video element is visible', async () => {
        await pomPages.colorsApiPage.colorsApiLightSkinVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that light skin video is playing', async () => {
        await pomPages.colorsApiPage.colorsApiLightSkinVideoComponent.validateVideoIsPlaying(true);
    });
}
