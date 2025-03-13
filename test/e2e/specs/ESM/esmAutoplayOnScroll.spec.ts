import { vpTest } from '../../fixtures/vpTest';
import { ESM_URL } from '../../testData/esmUrl';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { testAutoplayOnScrollPageVideoIsPlaying } from '../commonSpecs/autoplayOnScrollVideoPlaying';

const link = getEsmLinkByName(ExampleLinkName.AutoplayOnScroll);

vpTest(`Test if video on ESM autoplay on scroll page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testAutoplayOnScrollPageVideoIsPlaying(page, pomPages, link);
});
