import { vpTest } from '../../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';

// Link to AI Highlights Graph page
const link = getLinkByName(ExampleLinkName.AIHighlightsGraph);
/**
 * Testing if video on highlights graph page is playing by checking that is pause return false.
 */
vpTest(`Test if video on highlights graph page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to highlights graph page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that the video is playing', async () => {
        await pomPages.highlightGraphPage.videoHighlightsGraphPage.validateVideoIsPlaying(true);
    });
});
