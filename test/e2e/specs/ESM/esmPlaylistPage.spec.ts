import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testPlaylistPageVideoIsPlaying } from '../commonSpecs/playlistPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.Playlist);

vpTest(`Test if 2 videos on ESM playlist page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testPlaylistPageVideoIsPlaying(page, pomPages, link);
});
