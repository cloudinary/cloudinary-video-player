import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testForceHlsSubtitlesPageVideoIsPlaying } from '../commonSpecs/forceHlsSubtitlesPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.ForceHLSSubtitles);

vpTest(`Test if video on force HLS subtitles page is playing as expected`, async ({ page, pomPages }) => {
    await testForceHlsSubtitlesPageVideoIsPlaying(page, pomPages, link);
});
