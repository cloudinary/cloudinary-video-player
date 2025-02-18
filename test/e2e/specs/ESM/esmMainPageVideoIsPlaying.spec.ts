import { vpTest } from '../../fixtures/vpTest';
import { testMainPageVideoIsPlaying } from '../commonSpecs/mainPageVideoPlaying';
import { ESM_URL } from '../../testData/esmUrl';

/**
 * Testing if video on main page is playing by checking that is pause return false.
 * The video in the main page is not configured as autoplay so first need to click on play button.
 */
vpTest(`Test if video on ESM main page can play as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testMainPageVideoIsPlaying(page, pomPages.mainPage.videoMainPage);
});
