import { expect } from '@playwright/test';
import { vpTest } from '../fixtures/vpTest';



vpTest('Check no errors on console', async ({ page, consoleErrors, vpExamples }) => {
  await vpExamples.clickLinkByName('Adaptive Streaming');
  const a = await vpExamples.examplesList.all();
  for (const li of a) {
    const linkAttribute = await li.getAttribute('href');
    await li.click();
    expect((page.url()).includes(linkAttribute)).toBeTruthy();
    expect(consoleErrors).toHaveLength(0);
  }
});
