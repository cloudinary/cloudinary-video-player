import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testMultiplePlayersPageVideoIsPlaying } from '../commonSpecs/multiplePlayersPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.MultiplePlayers);

vpTest(`Test if 3 videos on multiple players page are playing as expected`, async ({ page, pomPages }) => {
    await testMultiplePlayersPageVideoIsPlaying(page, pomPages, link);
});
