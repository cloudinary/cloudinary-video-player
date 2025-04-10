import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testProfilesPageVideoIsPlaying } from '../commonSpecs/profilesPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.Profiles);

vpTest(`Test if 3 videos on profiles page are playing as expected`, async ({ page, pomPages }) => {
    await testProfilesPageVideoIsPlaying(page, pomPages, link);
});
