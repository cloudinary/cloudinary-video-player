import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testRawUrlPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to raw URL page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that raw url video is playing', async () => {
        await pomPages.rawUrlPage.rawUrlVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Validating that raw url adaptive video is playing', async () => {
        await pomPages.rawUrlPage.rawUrlAdaptiveVideoComponent.validateVideoIsPlaying(true);
    });
}
