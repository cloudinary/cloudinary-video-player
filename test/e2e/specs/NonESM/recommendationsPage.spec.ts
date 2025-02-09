import { vpTest } from '../../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.Recommendations);

vpTest(`Test if video on recommendations page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to recommendations page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that recommendations video is playing', async () => {
        await pomPages.recommendationsPage.recommendationsVideoComponent.validateVideoIsPlaying(true);
    });
});
