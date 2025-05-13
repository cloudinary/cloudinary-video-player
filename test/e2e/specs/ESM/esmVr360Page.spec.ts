import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testVr360PageVideoIsPlaying } from '../commonSpecs/vr360VideosPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.VR360Videos);

vpTest(`Test if video on ESM VR 360 videos page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testVr360PageVideoIsPlaying(page, pomPages, link);
});
