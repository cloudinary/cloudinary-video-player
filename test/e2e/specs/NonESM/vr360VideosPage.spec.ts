import { vpTest } from '../../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.VR360Videos);

vpTest(`Test if video on VR 360 videos page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to VR 360 videos page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Click on play button of 360 video play video', async () => {
        return pomPages.vr360VideosPage.vr360VideoComponent.clickPlay();
    });
    await test.step('Validating that 360 video is playing', async () => {
        await pomPages.vr360VideosPage.vr360VideoComponent.validateVideoIsPlaying(true, 6000);
    });
});
