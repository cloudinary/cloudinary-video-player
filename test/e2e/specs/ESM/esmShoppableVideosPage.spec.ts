import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testShoppableVideosPageVideoIsPlaying } from '../commonSpecs/shoppableVideosPageVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.ShoppableVideos);

vpTest(`Test if video on ESM shoppable videos page is playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testShoppableVideosPageVideoIsPlaying(page, pomPages, link);
});
