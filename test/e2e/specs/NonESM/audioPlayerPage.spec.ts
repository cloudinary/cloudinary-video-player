import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testAudioPlayerPageVideosArePlaying } from '../commonSpecs/audioPlayerPageVideoPlaying';

// Link to audio player page
const link = getLinkByName(ExampleLinkName.AudioPlayer);
/**
 * Testing if videos on audio player page are playing by checking that is pause return false.
 */
vpTest(`Test if 2 videos on audio player page are playing as expected`, async ({ page, pomPages }) => {
    await testAudioPlayerPageVideosArePlaying(page, pomPages, link);
});
