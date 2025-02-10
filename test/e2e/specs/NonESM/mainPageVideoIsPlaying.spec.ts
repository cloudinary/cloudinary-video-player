import { vpTest } from '../../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';

/**
 * Testing if video on main page is playing by checking that is pause return false.
 * The video in the main page is not configured as autoplay so first need to click on play button.
 */
vpTest(`Test if video on main page can play as expected`, async ({ page, pomPages }) => {
    await test.step('Click on play button to play video', async () => {
        //making sure the page is loaded
        await waitForPageToLoadWithTimeout(page, 5000);
        return pomPages.mainPage.videoMainPage.clickPlay();
    });
    await test.step('Validating that the video is playing', async () => {
        await pomPages.mainPage.videoMainPage.validateVideoIsPlaying(true);
    });
});
