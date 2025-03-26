import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testCldAnalyticsPageVideoIsPlaying } from '../commonSpecs/cldAnalyticsPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.CloudinaryAnalytics);

vpTest(`Test if 4 videos on ESM Cloudinary analytics page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testCldAnalyticsPageVideoIsPlaying(page, pomPages, link);
});
