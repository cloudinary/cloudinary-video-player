import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testVastAndVpaidPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to vast and vpaid page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Click on play button of single video with ads to play video', async () => {
        return pomPages.vastAndVpaidPage.singleVideoWithAdsVideoComponent.clickPlay();
    });
    //Sending timeout of 12 seconds to wait until the ad finishes (10 sec) and the video will start
    await test.step('Validating that single video with ads is playing', async () => {
        await pomPages.vastAndVpaidPage.singleVideoWithAdsVideoComponent.validateVideoIsPlaying(true, 12000);
    });
    await test.step('Validating that playlist with ads video is playing', async () => {
        await pomPages.vastAndVpaidPage.playlistWithAdsVideoComponent.validateVideoIsPlaying(true, 12000);
    });
}
