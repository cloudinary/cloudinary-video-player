import { vpTest } from '../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

// Link to audio player page
const link = getLinkByName(ExampleLinkName.AudioPlayer);
/**
 * Testing if videos on audio player page are playing by checking that is pause return false.
 */
vpTest(`Test if 2 videos on audio player page are playing as expected`, async ({ page, pomPages }) => {
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
});
