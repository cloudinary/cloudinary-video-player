import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testAutoplayOnScrollPageVideoIsPlaying } from '../commonSpecs/autoplayOnScrollVideoPlaying';

// Link to autoplay on scroll page
const link = getLinkByName(ExampleLinkName.AutoplayOnScroll);

vpTest(`Test if video on autoplay on scroll page is playing as expected`, async ({ page, pomPages }) => {
    await testAutoplayOnScrollPageVideoIsPlaying(page, pomPages, link);
});
