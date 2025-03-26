import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testCldAnalyticsPageVideoIsPlaying } from '../commonSpecs/cldAnalyticsPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.CloudinaryAnalytics);

vpTest(`Test if 4 videos on Cloudinary analytics page are playing as expected`, async ({ page, pomPages }) => {
    await testCldAnalyticsPageVideoIsPlaying(page, pomPages, link);
});
