import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testAspectRatioCropPageVideoIsPlaying } from '../commonSpecs/aspectRatioCropPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.AspectRatioCrop);

vpTest('Test if video on aspect ratio & crop page is playing as expected', async ({ page, pomPages }) => {
    await testAspectRatioCropPageVideoIsPlaying(page, pomPages, link);
});
