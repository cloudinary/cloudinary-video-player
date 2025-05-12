import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testVideoTransformationsPageVideoIsPlaying } from '../commonSpecs/videoTransformationsPage';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.VideoTransformations);

vpTest(`Test if 3 videos on ESM video transformations page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testVideoTransformationsPageVideoIsPlaying(page, pomPages, link);
});
