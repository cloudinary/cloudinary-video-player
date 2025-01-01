import { vpTest } from '../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.FloatingPlayer);

vpTest(`Test if video on floating player page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to floating player page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that floating player video is playing', async () => {
        await pomPages.floatingPlayerPage.floatingPlayerVideoComponent.validateVideoIsPlaying(true);
    });
});
