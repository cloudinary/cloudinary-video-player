import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testComponentsPageVideoIsPlaying } from '../commonSpecs/componentsPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.Components);

vpTest(`Test if video on components page is playing as expected`, async ({ page, pomPages }) => {
    await testComponentsPageVideoIsPlaying(page, pomPages, link);
});
