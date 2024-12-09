import { vpTest } from '../fixtures/vpTest';
import { expect, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

// Link to API and Events page
const link = getLinkByName(ExampleLinkName.APIAndEvents);
/**
 * Testing if video on API and Events page is playing by checking that is pause return false.
 */
vpTest(`Test if video on API and Events page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to api and events page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that the video is playing (in case isPause is false)', async () => {
        expect(await pomPages.apiAndEventsPage.apiAndEventsVideoComponent.isPaused()).toEqual(false);
    });
});
