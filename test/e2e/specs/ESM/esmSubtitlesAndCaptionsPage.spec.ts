import { vpTest } from '../../fixtures/vpTest';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testSubtitlesAndCaptionsPageVideoIsPlaying } from '../commonSpecs/subtitlesAndCaptionsPgaeVideoPlaying';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { ESM_URL } from '../../testData/esmUrl';

const link = getEsmLinkByName(ExampleLinkName.SubtitlesAndCaptions);

vpTest(`Test if 5 videos on ESM subtitles and captions page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testSubtitlesAndCaptionsPageVideoIsPlaying(page, pomPages, link);
});
