import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testMultiplePlayersPageVideoIsPlaying } from '../commonSpecs/multiplePlayersPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.MultiplePlayers);

vpTest(`Test if 3 videos on ESM multiple players page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testMultiplePlayersPageVideoIsPlaying(page, pomPages, link);
});
