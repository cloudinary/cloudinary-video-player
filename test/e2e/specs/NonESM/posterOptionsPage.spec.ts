import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testPosterOptionsPageVideoIsPlaying } from '../commonSpecs/posterOptionsPage';

const link = getLinkByName(ExampleLinkName.PosterOptions);

vpTest(`Test if 4 videos on poster options page are playing as expected`, async ({ page, pomPages }) => {
    await testPosterOptionsPageVideoIsPlaying(page, pomPages, link);
});
