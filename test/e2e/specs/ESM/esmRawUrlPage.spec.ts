import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testRawUrlPageVideoIsPlaying } from '../commonSpecs/rawUrlPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.RawURL);

vpTest(`Test if 2 videos on ESM raw URL page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testRawUrlPageVideoIsPlaying(page, pomPages, link);
});
