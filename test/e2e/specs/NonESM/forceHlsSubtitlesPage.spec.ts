import { vpTest } from '../../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.ForceHLSSubtitles);

vpTest(`Test if video on force HLS subtitles page is playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to force HLS subtitles page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that force HLS subtitles video is playing', async () => {
        await pomPages.forceHlsSubtitlesPage.forceHlsSubtitlesVideoComponent.validateVideoIsPlaying(true);
    });
});
