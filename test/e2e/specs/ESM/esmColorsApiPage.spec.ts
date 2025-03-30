import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';
import { testColorsApiPageVideoIsPlaying } from '../commonSpecs/colorsApiPageVideoPlaying';

const link = getEsmLinkByName(ExampleLinkName.ColorsAPI);

vpTest(`Test if 3 videos on ESM colors API page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testColorsApiPageVideoIsPlaying(page, pomPages, link);
});
