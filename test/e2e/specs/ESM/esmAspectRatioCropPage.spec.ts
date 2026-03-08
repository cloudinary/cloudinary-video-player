import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { ESM_URL } from '../../testData/esmUrl';
import { testAspectRatioCropPageVideoIsPlaying } from '../commonSpecs/aspectRatioCropPageVideoPlaying';

const link = getEsmLinkByName(ExampleLinkName.AspectRatioCrop);

vpTest('Test if video on ESM aspect ratio & crop page is playing as expected', async ({ page, pomPages }) => {
    await test.step('Navigate to ESM', async () => {
        await page.goto(ESM_URL);
    });
    await testAspectRatioCropPageVideoIsPlaying(page, pomPages, link);
});
