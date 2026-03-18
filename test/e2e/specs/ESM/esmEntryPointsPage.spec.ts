import { expect } from '@playwright/test';
import { vpTest } from '../../fixtures/vpTest';
import { ESM_URL } from '../../testData/esmUrl';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';

const link = getEsmLinkByName(ExampleLinkName.EntryPoints);

vpTest('Given entry-points page, when loaded, then all exports resolve without errors', async ({ page, pomPages, consoleErrors }) => {
    await page.goto(ESM_URL);
    await pomPages.mainPage.clickLinkByName(link.name);
    await waitForPageToLoadWithTimeout(page, 10000);

    const results = await page.locator('#results').textContent();
    expect(results).toContain('Player created successfully');
    expect(results).not.toContain('Error');

    const failCount = (results.match(/❌/g) || []).length;
    expect(failCount, `${failCount} checks failed in entry-points results`).toBe(0);
});
