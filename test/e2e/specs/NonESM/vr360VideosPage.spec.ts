import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testVr360PageVideoIsPlaying } from '../commonSpecs/vr360VideosPageVideoPlaying';

const link = getLinkByName(ExampleLinkName.VR360Videos);

vpTest(`Test if video on VR 360 videos page is playing as expected`, async ({ page, pomPages }) => {
    await testVr360PageVideoIsPlaying(page, pomPages, link);
});
