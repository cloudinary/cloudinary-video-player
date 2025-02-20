import { vpTest } from '../../fixtures/vpTest';
import { ESM_URL } from '../../testData/esmUrl';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { testAudioPlayerPageVideosArePlaying } from '../commonSpecs/audioPlayerPageVideoPlaying';

const link = getEsmLinkByName(ExampleLinkName.AudioPlayer);

vpTest(`Test if 2 videos on ESM audio player page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testAudioPlayerPageVideosArePlaying(page, pomPages, link);
});
