import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testForceHlsSubtitlesPageVideoIsPlaying } from '../commonSpecs/forceHlsSubtitlesPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.ForceHLSSubtitles);

vpTest(`Test if video on ESM force HLS subtitles page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testForceHlsSubtitlesPageVideoIsPlaying(page, pomPages, link);
});
