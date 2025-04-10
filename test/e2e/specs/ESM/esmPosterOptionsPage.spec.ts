import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testPosterOptionsPageVideoIsPlaying } from '../commonSpecs/posterOptionsPage';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.PosterOptions);

vpTest(`Test if 4 videos on ESM poster options page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testPosterOptionsPageVideoIsPlaying(page, pomPages, link);
});
