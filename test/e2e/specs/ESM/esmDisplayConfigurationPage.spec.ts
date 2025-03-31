import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';
import { testDisplayConfigurationPageVideoIsPlaying } from '../commonSpecs/displayConfigurationPageVideoPlaying';

const link = getEsmLinkByName(ExampleLinkName.DisplayConfigurations);

vpTest(`Test if video on ESM display configurations page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testDisplayConfigurationPageVideoIsPlaying(page, pomPages, link);
});
