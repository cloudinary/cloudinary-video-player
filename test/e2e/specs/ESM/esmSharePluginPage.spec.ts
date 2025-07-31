import { vpTest } from '../../fixtures/vpTest';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testSharePluginPageVideoIsPlaying } from '../commonSpecs/sharePluginPageVideoPlaying';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.ShareAndDownload);

vpTest(`Test if videos on Share & Download ESM page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testSharePluginPageVideoIsPlaying(page, pomPages, link);
});
