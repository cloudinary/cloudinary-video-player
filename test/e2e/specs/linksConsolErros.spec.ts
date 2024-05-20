import { ConsoleMessage, Page, expect } from '@playwright/test';
import { vpTest } from '../fixtures/vpTest';
import { LINKS } from '../testData/pageLinksData';


for(const link of LINKS) {
  vpTest(`Test console errors on link link ${link.name}`, async ({ page, consoleErrors, vpExamples }) => {
    await vpExamples.clickLinkByName(link.name);
    await waitForPageToLoadWithTimeout(page, 3000);

    expect(page.url()).toContain(link.endpoint);

    switch (link.name) {
      case 'Custom Errors':
        validateCustomErrorsPageErrors(consoleErrors);  
        break;
      default:
        expect(consoleErrors).toHaveLength(0);
    }
  })
}

vpTest(`Link count test`, async ({ page }) => {
  const expectedNumberOfLinks = 37;
  const numberOfLinks = await page.getByRole('link').count();
  expect(numberOfLinks).toBe(expectedNumberOfLinks);
});

/**
 * Wait until there are no network connections for at least 500 ms or for given timeout to pass.
 * Needed for console logs to appear. and in pages that loading video 'waitForLoadState('networkidle')' entering a long loop.
 */
async function waitForPageToLoadWithTimeout(page: Page, timeout: number): Promise<unknown> {
  return Promise.race([page.waitForLoadState('networkidle'), new Promise(r => setTimeout(r, timeout))]);
}

function validateCustomErrorsPageErrors(consoleErrors: ConsoleMessage[]): void {
  for(const errorLog of consoleErrors) {
    console.log(errorLog.text());
  }
  expect(consoleErrors.length).toBeGreaterThan(1);
}


