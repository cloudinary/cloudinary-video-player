import { ConsoleMessage, Page, expect } from '@playwright/test';
import { vpTest } from '../fixtures/vpTest';
import { LINKS } from '../testData/pageLinksData';

for (const link of LINKS) {
    vpTest(`Test console errors on link ${link.name}`, async ({ page, consoleErrors, vpExamples, browserName }) => {
        await vpExamples.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
        expect(page.url()).toContain(link.endpoint);
        handleCommonBrowsersErrors(link.name, consoleErrors);
    });
}

vpTest('Link count test', async ({ page }) => {
    const expectedNumberOfLinks = 37;
    const numberOfLinks = await page.getByRole('link').count();
    expect(numberOfLinks).toBe(expectedNumberOfLinks);
});

function handleCommonBrowsersErrors(linkName: string, consoleErrors: ConsoleMessage[]) {
    switch (linkName) {
        case 'Custom Errors':
            validatePageErrors(
                consoleErrors,
                ['(CODE:999 undefined) My custom error message'],
                ['No compatible source was found for this media', 'Video cannot be played Public ID snow_horses not found', 'the server responded with a status of 404', 'Cannot read properties of undefined']
            );
            break;
        case 'Debug mode':
            validatePageErrors(consoleErrors, ['invalid player configuration', `cloudinary video player: \'fluid\' should be a boolean`], []);
            break;
        case 'VAST & VPAID Support':
            validatePageErrors(consoleErrors, ['The Cross-Origin-Opener-Policy header'], ['']);
            break;
        default:
            expect(consoleErrors).toHaveLength(0);
    }
}

/**
 * Wait until there are no network connections for at least 500 ms or for given timeout to pass.
 * Needed for console logs to appear. and in pages that loading video 'waitForLoadState('networkidle')' entering a long loop.
 */
async function waitForPageToLoadWithTimeout(page: Page, timeout: number): Promise<unknown> {
    return Promise.race([page.waitForLoadState('networkidle'), new Promise((r) => setTimeout(r, timeout))]);
}

/**
 * Validating that the expected error is part of the console errors
 */
function validatePageErrors(consoleErrors: ConsoleMessage[], expectedErrorMessages: string[], ignoreErrorMessages: string[]): void {
    const relevantMessages = new Array<ConsoleMessage>();

    for (const consoleError of consoleErrors) {
        let shouldBeIgnored = false;
        for (const ignoreError of ignoreErrorMessages) {
            if (consoleError.text().includes(ignoreError)) {
                shouldBeIgnored = true;
            }
        }
        if (!shouldBeIgnored) {
            relevantMessages.push(consoleError);
        }
    }
    let numberOfErrorsFound = relevantMessages.length;

    for (const expectedErrorMessage of expectedErrorMessages) {
        for (const relevantError of relevantMessages) {
            if (relevantError.text().includes(expectedErrorMessage)) {
                numberOfErrorsFound--;
            }
        }
    }

    expect(numberOfErrorsFound).toBe(0);
}
