import { vpTest } from '../fixtures/vpTest';
import { expect, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { ExampleLinkType } from '../types/exampleLinkType';
import { HighlightsGraphPage } from '../src/pom/highlightsGraphPage';

// Link to AI Highlights Graph page
const link: ExampleLinkType = { name: 'AI Highlights Graph', endpoint: 'highlights-graph.html' };
/**
 * Testing if video on highlights graph page is playing by checking that is pause return false.
 */
vpTest(`Test if video on highlights graph page is playing as expected`, async ({ page, vpExamples }) => {
    await test.step('Navigate to highlights graph page by clicking on link', async () => {
        await vpExamples.clickLinkByName(link.name);
        //making sure the page is loaded
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that the video is playing (in case isPause is false)', async () => {
        const highlightGrapghPage = new HighlightsGraphPage(page);
        expect(await highlightGrapghPage.videoHighlightsGraphPage.isPaused()).toEqual(false);
    });
});
