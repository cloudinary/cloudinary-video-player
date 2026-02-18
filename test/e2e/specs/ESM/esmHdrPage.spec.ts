import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testHdrPageVideoIsPlaying } from '../commonSpecs/hdrPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.HDR);

vpTest(`Test if video on ESM HDR page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testHdrPageVideoIsPlaying(page, pomPages, link);
});
