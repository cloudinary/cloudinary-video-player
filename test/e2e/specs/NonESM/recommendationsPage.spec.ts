import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testRecommendationsPageVideoIsPlaying } from '../commonSpecs/recommendationsPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.Recommendations);

vpTest(`Test if video on recommendations page is playing as expected`, async ({ page, pomPages }) => {
    await testRecommendationsPageVideoIsPlaying(page, pomPages, link);
});
