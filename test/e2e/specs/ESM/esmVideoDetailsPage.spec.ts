import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testVideoDetailsPageVideoIsPlaying } from '../commonSpecs/videoDetailsPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.VideoDetails);

vpTest(`Test if videos on ESM video details page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testVideoDetailsPageVideoIsPlaying(page, pomPages, link);
}); 
