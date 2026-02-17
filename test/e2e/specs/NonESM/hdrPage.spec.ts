import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testHdrPageVideoIsPlaying } from '../commonSpecs/hdrPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.HDR);

vpTest(`Test if video on HDR page is playing as expected`, async ({ page, pomPages }) => {
    await testHdrPageVideoIsPlaying(page, pomPages, link);
});
