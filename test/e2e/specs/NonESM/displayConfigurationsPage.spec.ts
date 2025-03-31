import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testDisplayConfigurationPageVideoIsPlaying } from '../commonSpecs/displayConfigurationPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.DisplayConfigurations);

vpTest(`Test if video on display configurations page is playing as expected`, async ({ page, pomPages }) => {
    await testDisplayConfigurationPageVideoIsPlaying(page, pomPages, link);
});
