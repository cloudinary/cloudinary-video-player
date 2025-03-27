import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';
import { testCodecsAndFormatsPageVideoIsPlaying } from '../commonSpecs/codecsAndFormatsVideoPlaying';

const link = getEsmLinkByName(ExampleLinkName.CodecsAndFormats);

vpTest(`Test if 3 videos on ESM codecs and formats page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testCodecsAndFormatsPageVideoIsPlaying(page, pomPages, link);
});
