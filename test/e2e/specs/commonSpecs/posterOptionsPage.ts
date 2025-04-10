import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testPosterOptionsPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to poster options page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Click on play button of custom image poster player to play video', async () => {
        return pomPages.posterOptionsPage.posterOptionsCustomImageVideoComponent.clickPlay();
    });
    await test.step('Validating that the custom image poster video is playing', async () => {
        await pomPages.posterOptionsPage.posterOptionsCustomImageVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of specific frame poster player to play video', async () => {
        return pomPages.posterOptionsPage.posterOptionsSpecificFrameVideoComponent.clickPlay();
    });
    await test.step('Validating that specific frame poster video is playing', async () => {
        await pomPages.posterOptionsPage.posterOptionsSpecificFrameVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of transformations array poster player to play video', async () => {
        return pomPages.posterOptionsPage.posterOptionsTransformationsArrayVideoComponent.clickPlay();
    });
    await test.step('Validating that transformations array poster video is playing', async () => {
        await pomPages.posterOptionsPage.posterOptionsTransformationsArrayVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of raw url no poster player to play video', async () => {
        return pomPages.posterOptionsPage.posterOptionsRawUrlNoPosterVideoComponent.clickPlay();
    });
    await test.step('Validating that raw url no poster video is playing', async () => {
        await pomPages.posterOptionsPage.posterOptionsRawUrlNoPosterVideoComponent.validateVideoIsPlaying(true);
    });
}
