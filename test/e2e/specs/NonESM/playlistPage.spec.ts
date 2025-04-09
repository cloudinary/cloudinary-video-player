import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testPlaylistPageVideoIsPlaying } from '../commonSpecs/playlistPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.Playlist);

vpTest(`Test if 2 videos on playlist page are playing as expected`, async ({ page, pomPages }) => {
    await testPlaylistPageVideoIsPlaying(page, pomPages, link);
});
