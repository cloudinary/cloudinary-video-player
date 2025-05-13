import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testVastAndVpaidPageVideoIsPlaying } from '../commonSpecs/vastAndVpaidPage';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.VASTAndVPAIDSupport);

vpTest(`Test if 2 videos on ESM vast and vpaid page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testVastAndVpaidPageVideoIsPlaying(page, pomPages, link);
});
