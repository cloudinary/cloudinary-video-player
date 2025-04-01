import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testFloatingPlayerPageVideoIsPlaying } from '../commonSpecs/floatingPlayerPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.FloatingPlayer);

vpTest(`Test if video on floating player page is playing as expected`, async ({ page, pomPages }) => {
    await testFloatingPlayerPageVideoIsPlaying(page, pomPages, link);
});
