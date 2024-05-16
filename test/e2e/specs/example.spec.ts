import { expect } from '@playwright/test';
import { vpTest } from '../fixtures/vpTest';

const skipLinksArray = ['ESM Imports', 'Custom Errors', 'Debug mode'];

vpTest('Check no errors on console', async ({ page, consoleErrors, vpExamples }) => {
  //await vpExamples.clickLinkByName('Adaptive Streaming');
  const listItems = await vpExamples.examplesList.getByRole('listitem').all();
  for (const listItem of listItems) {
    const link = await listItem.getByRole('link');
    const linkAttribute = await link.getAttribute('href');
    const linkText = await link.innerText();
    if (skipLinksArray.includes(linkText)){
      continue;
    }
    const linkAttributeModified = linkAttribute.slice(1);
    await link.click();
    await page.waitForLoadState('load');
    await vpTest.step(`Navigate to link ${linkAttributeModified}`, async ()=> {
      expect(page.url()).toContain(linkAttributeModified);
      expect(consoleErrors).toHaveLength(0);
      consoleErrors = [];
      await vpExamples.goto();
    });
  }
});
