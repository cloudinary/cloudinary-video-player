import { vpTest } from '../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.RawURL);

vpTest(`Test if 2 videos on raw URL page are playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to raw URL page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that raw url video is playing', async () => {
        await pomPages.rawUrlPage.rawUrlVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Validating that raw url adaptive video is playing', async () => {
        await pomPages.rawUrlPage.rawUrlAdaptiveVideoComponent.validateVideoIsPlaying(true);
    });
});
