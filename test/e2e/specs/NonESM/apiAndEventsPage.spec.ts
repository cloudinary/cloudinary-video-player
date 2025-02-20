import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testApiAndEventsPageVideoIsPlaying } from '../commonSpecs/apiAndEventsPageVideoPlaying';

// Link to API and Events page
const link = getLinkByName(ExampleLinkName.APIAndEvents);

vpTest(`Test if video on API and Events page is playing as expected`, async ({ page, pomPages }) => {
    await testApiAndEventsPageVideoIsPlaying(page, pomPages, link);
});
