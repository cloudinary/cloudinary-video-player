import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testShoppableVideosPageVideoIsPlaying } from '../commonSpecs/shoppableVideosPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.ShoppableVideos);

vpTest(`Test if video on shoppable videos page is playing as expected`, async ({ page, pomPages }) => {
    await testShoppableVideosPageVideoIsPlaying(page, pomPages, link);
});
