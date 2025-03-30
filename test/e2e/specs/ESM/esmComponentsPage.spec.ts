import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';
import { testComponentsPageVideoIsPlaying } from '../commonSpecs/componentsPageVideoPlaying';

const link = getEsmLinkByName(ExampleLinkName.Components);

vpTest(`Test if video on ESM components page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testComponentsPageVideoIsPlaying(page, pomPages, link);
});
