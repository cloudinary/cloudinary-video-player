import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { VideoComponent } from '../../components/videoComponent';

export async function testMainPageVideoIsPlaying(page: Page, videoElement: VideoComponent) {
    await test.step('Click on play button to play video', async () => {
        await waitForPageToLoadWithTimeout(page, 5000);
        return videoElement.clickPlay();
    });
    await test.step('Validating that the video is playing', async () => {
        await videoElement.validateVideoIsPlaying(true);
    });
}
