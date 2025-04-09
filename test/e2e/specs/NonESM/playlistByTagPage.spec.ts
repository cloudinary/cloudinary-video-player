import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testPlaylistByTagPageVideoIsPlaying } from '../commonSpecs/playlistByTagPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.PlaylistByTag);

vpTest(`Test if video on playlist by tag page is playing as expected`, async ({ page, pomPages }) => {
    await testPlaylistByTagPageVideoIsPlaying(page, pomPages, link);
});
