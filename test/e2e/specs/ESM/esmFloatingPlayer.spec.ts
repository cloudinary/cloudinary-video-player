import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';
import { testFloatingPlayerPageVideoIsPlaying } from '../commonSpecs/floatingPlayerPageVideoPlaying';

const link = getEsmLinkByName(ExampleLinkName.FloatingPlayer);

vpTest(`Test if video on ESM floating player page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testFloatingPlayerPageVideoIsPlaying(page, pomPages, link);
});
