import { expect } from '@playwright/test';
import { vpTest } from '../../fixtures/vpTest';
import { ESM_URL } from '../../testData/esmUrl';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';

const link = getEsmLinkByName(ExampleLinkName.LazyLoading);

vpTest('Given lazy-loading page, when load button clicked, then player loads on demand', async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await pomPages.mainPage.clickLinkByName(link.name);
    await waitForPageToLoadWithTimeout(page, 5000);

    const results = await page.locator('#results').textContent();
    expect(results).toContain('Lazy stub imported');
    expect(results).not.toContain('Error');

    await page.locator('#load-btn').click();
    await waitForPageToLoadWithTimeout(page, 10000);

    const updatedResults = await page.locator('#results').textContent();
    expect(updatedResults).toContain('Player loaded and created');
});
