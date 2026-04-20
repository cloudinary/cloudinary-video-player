import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testProfileAndConfigAppletUrlsFetch } from '../commonSpecs/profilesAndConfigAppletFetch';

const link = getLinkByName(ExampleLinkName.Profiles);

vpTest('Profile and config requests are sent with correct URLs',
  async ({ page, pomPages }) => {
    await testProfileAndConfigAppletUrlsFetch(page, pomPages, link);
  }
);