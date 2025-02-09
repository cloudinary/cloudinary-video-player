import { vpTest } from '../../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.FluidLayouts);

vpTest(`Test if video on fluid layouts page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to fluid layouts page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that fluid layouts video is playing', async () => {
        await pomPages.fluidLayoutsPage.fluidLayoutsVideoComponent.validateVideoIsPlaying(true);
    });
});
