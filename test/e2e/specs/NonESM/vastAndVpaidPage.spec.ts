import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testVastAndVpaidPageVideoIsPlaying } from '../commonSpecs/vastAndVpaidPage';

const link = getLinkByName(ExampleLinkName.VASTAndVPAIDSupport);

vpTest(`Test if 2 videos on vast and vpaid page are playing as expected`, async ({ page, pomPages }) => {
    await testVastAndVpaidPageVideoIsPlaying(page, pomPages, link);
});
