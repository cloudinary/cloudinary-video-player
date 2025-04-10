import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testRecommendationsPageVideoIsPlaying } from '../commonSpecs/recommendationsPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.Recommendations);

vpTest(`Test if video on ESM recommendations page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testRecommendationsPageVideoIsPlaying(page, pomPages, link);
});
