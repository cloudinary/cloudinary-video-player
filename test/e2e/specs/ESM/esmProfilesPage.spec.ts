import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testProfilesPageVideoIsPlaying } from '../commonSpecs/profilesPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.Profiles);

vpTest(`Test if 3 videos on ESM profiles page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testProfilesPageVideoIsPlaying(page, pomPages, link);
});
