import { ConsoleMessage, expect } from '@playwright/test';
import { vpTest } from '../../fixtures/vpTest';
import { ESM_LINKS } from '../../testData/esmPageLinksData';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { validatePageErrors } from '../../src/helpers/validatePageErrors';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { ESM_URL } from '../../testData/esmUrl';

/**
 * Console error test generated by LINKS object array data.
 */
for (const link of ESM_LINKS) {
    vpTest(`Test console errors on link ${link.name}`, async ({ page, consoleErrors, pomPages }) => {
        vpTest.skip(link.name === 'Adaptive Streaming', 'Flaky on CI');
        await page.goto(ESM_URL);
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
        expect(page.url()).toContain(link.endpoint);
        handleCommonEsmBrowsersErrors(link.name, consoleErrors);
    });
}

/**
 * Testing number of links in page.
 */
vpTest('ESM page Link count test', async ({ page }) => {
    await page.goto(ESM_URL);
    const expectedNumberOfLinks = 34;
    const numberOfLinks = await page.getByRole('link').count();
    expect(numberOfLinks).toBe(expectedNumberOfLinks);
});
/**
 * Helper function to handle common browser errors.
 */
function handleCommonEsmBrowsersErrors(linkName: ExampleLinkName, consoleErrors: ConsoleMessage[]) {
    switch (linkName) {
        case ExampleLinkName.CustomErrors:
            validatePageErrors(
                consoleErrors,
                ['(CODE:999 undefined) My custom error message'],
                ['No compatible source was found for this media', 'Video cannot be played Public ID snow_horses not found', 'the server responded with a status of 404', 'Cannot read properties of undefined']
            );
            break;
        case ExampleLinkName.VASTAndVPAIDSupport:
            validatePageErrors(consoleErrors, [], ["Blocked script execution in 'about:blank' because the document's frame is sandboxed and the 'allow-scripts' permission is not set", 'the server responded with a status of 404']);
            break;
        default:
            validatePageErrors(consoleErrors, [], ['the server responded with a status of 404']);
    }
}
