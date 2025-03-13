import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testAutoplayOnScrollPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to autoplay on scroll page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that the video is not playing before scrolling', async () => {
        await pomPages.autoplayOnScrollPage.autoplayOnScrollVideoComponent.validateVideoIsPlaying(false);
    });
    await test.step('Scroll until the video element is visible', async () => {
        await pomPages.autoplayOnScrollPage.autoplayOnScrollVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that the video is auto playing after scrolling', async () => {
        await pomPages.autoplayOnScrollPage.autoplayOnScrollVideoComponent.validateVideoIsPlaying(true);
    });
}
