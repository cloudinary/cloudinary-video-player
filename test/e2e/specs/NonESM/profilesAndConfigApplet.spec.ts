import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testProfileAndConfigAppletUrlsAndMockedColors } from '../commonSpecs/profilesAndConfigApplet';

const link = getLinkByName(ExampleLinkName.Profiles);

vpTest('Profile and config requests are sent with correct URLs and mocked colors are applied to the players',
  async ({ page, pomPages }) => {
    await testProfileAndConfigAppletUrlsAndMockedColors(page, pomPages, link);
  }
);