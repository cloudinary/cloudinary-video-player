import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testVideoDetailsPageVideoIsPlaying } from '../commonSpecs/videoDetailsPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.VideoDetails);

vpTest(`Test if videos on video details page are playing as expected`, async ({ page, pomPages }) => {
    await testVideoDetailsPageVideoIsPlaying(page, pomPages, link);
}); 
