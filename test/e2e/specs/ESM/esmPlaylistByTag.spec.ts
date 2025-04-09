import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { testPlaylistByTagPageVideoIsPlaying } from '../commonSpecs/playlistByTagPageVideoPlaying';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.PlaylistByTag);

vpTest(`Test if video on ESM playlist by tag page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testPlaylistByTagPageVideoIsPlaying(page, pomPages, link);
});
