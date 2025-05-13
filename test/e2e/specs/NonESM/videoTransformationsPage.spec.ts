import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testVideoTransformationsPageVideoIsPlaying } from '../commonSpecs/videoTransformationsPage';

const link = getLinkByName(ExampleLinkName.VideoTransformations);

vpTest(`Test if 3 videos on video transformations page are playing as expected`, async ({ page, pomPages }) => {
    await testVideoTransformationsPageVideoIsPlaying(page, pomPages, link);
});
