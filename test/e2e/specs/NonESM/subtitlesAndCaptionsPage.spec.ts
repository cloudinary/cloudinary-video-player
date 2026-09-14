import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testSubtitlesAndCaptionsPageVideoIsPlaying } from '../commonSpecs/subtitlesAndCaptionsPgaeVideoPlaying';
import { testSubtitlesAndCaptionsPortraitCues } from '../commonSpecs/subtitlesAndCaptionsPortraitCues';

const link = getLinkByName(ExampleLinkName.SubtitlesAndCaptions);

vpTest(`Test if 5 videos on subtitles and captions page are playing as expected`, async ({ page, pomPages }) => {
    await testSubtitlesAndCaptionsPageVideoIsPlaying(page, pomPages, link);
});

vpTest(`Test that captions on the portrait player stay inside the display and are sized by width`, async ({ page, pomPages }) => {
    await testSubtitlesAndCaptionsPortraitCues(page, pomPages, link);
});
