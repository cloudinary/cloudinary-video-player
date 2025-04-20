import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testSeekThumbnailsPageVideoIsPlaying } from '../commonSpecs/seekThumbnailsPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.SeekThumbnails);

vpTest(`Test if video on seek thumbnails page is playing as expected`, async ({ page, pomPages }) => {
    await testSeekThumbnailsPageVideoIsPlaying(page, pomPages, link);
});
