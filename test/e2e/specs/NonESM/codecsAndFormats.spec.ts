import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testCodecsAndFormatsPageVideoIsPlaying } from '../commonSpecs/codecsAndFormatsVideoPlaying';

const link = getLinkByName(ExampleLinkName.CodecsAndFormats);

vpTest(`Test if 3 videos on codecs and formats page are playing as expected`, async ({ page, pomPages }) => {
    await testCodecsAndFormatsPageVideoIsPlaying(page, pomPages, link);
});
