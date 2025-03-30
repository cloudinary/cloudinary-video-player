import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testColorsApiPageVideoIsPlaying } from '../commonSpecs/colorsApiPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.ColorsAPI);

vpTest(`Test if 3 videos on colors API page are playing as expected`, async ({ page, pomPages }) => {
    await testColorsApiPageVideoIsPlaying(page, pomPages, link);
});
