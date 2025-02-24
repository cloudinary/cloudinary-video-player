import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testAudioPlayerPageVideosArePlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to audio player page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Click on play button of video player to play video', async () => {
        return pomPages.audioPlayerPage.audioPlayerVideoComponent.clickPlay();
    });
    await test.step('Validating that the first video player is playing', async () => {
        await pomPages.audioPlayerPage.audioPlayerVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of audio player with transformation to play video', async () => {
        return pomPages.audioPlayerPage.audioPlayerWithTransformationVideoComponent.clickPlay();
    });
    await test.step('Validating that the audio player with transformation is playing', async () => {
        await pomPages.audioPlayerPage.audioPlayerWithTransformationVideoComponent.validateVideoIsPlaying(true);
    });
}
