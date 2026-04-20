import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testProfileAndConfigAppletMockedColors } from '../commonSpecs/profilesAndConfigAppletMockedColors';

const link = getLinkByName(ExampleLinkName.Profiles);

vpTest('Profile and config mocked colors are applied to the players',
  async ({ page, pomPages }) => {
    await testProfileAndConfigAppletMockedColors(page, pomPages, link);
  }
);