import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testSharePluginPageVideoIsPlaying } from '../commonSpecs/sharePluginPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.ShareAndDownload);

vpTest(`Test if videos on Share & Download page are playing as expected`, async ({ page, pomPages }) => {
    await testSharePluginPageVideoIsPlaying(page, pomPages, link);
});
