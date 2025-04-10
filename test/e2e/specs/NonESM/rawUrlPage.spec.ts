import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testRawUrlPageVideoIsPlaying } from '../commonSpecs/rawUrlPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.RawURL);

vpTest(`Test if 2 videos on raw URL page are playing as expected`, async ({ page, pomPages }) => {
    await testRawUrlPageVideoIsPlaying(page, pomPages, link);
});
