import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testSeekThumbnailsPageVideoIsPlaying } from '../commonSpecs/seekThumbnailsPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.SeekThumbnails);

vpTest(`Test if video on ESM seek thumbnails page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testSeekThumbnailsPageVideoIsPlaying(page, pomPages, link);
});
