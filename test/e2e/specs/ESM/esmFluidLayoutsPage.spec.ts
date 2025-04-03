import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testFluidLayoutsPageVideoIsPlaying } from '../commonSpecs/fluidLayoutsPageVideoPlaying';
import { ESM_URL } from '../../testData/esmUrl';

const link = getLinkByName(ExampleLinkName.FluidLayouts);

vpTest(`Test if video on ESM fluid layouts page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testFluidLayoutsPageVideoIsPlaying(page, pomPages, link);
});
