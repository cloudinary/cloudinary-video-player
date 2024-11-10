import { vpTest } from '../fixtures/vpTest';
import { expect, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';

/**
 * Testing if video on main page is playing by checking that is pause return false.
 * The video in the main page is not configured as autoplay so first need to click on play button.
 */
vpTest(`Test if video on main page is playing`, async ({ page, vpExamples }) => {
    await test.step('Click on play button to play video', async () => {
        //making sure the page is loaded
        await waitForPageToLoadWithTimeout(page, 5000);
        return vpExamples.videoMainPage.playVideo();
    });
    await test.step('Validating that the video is playing (in case isPause is false)', async () => {
        expect(await vpExamples.videoMainPage.isPaused()).toEqual(false);
    });
});
