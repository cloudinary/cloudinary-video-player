import { vpTest } from '../../fixtures/vpTest';
import { ESM_URL } from '../../testData/esmUrl';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { testApiAndEventsPageVideoIsPlaying } from '../commonSpecs/apiAndEventsPageVideoPlaying';

const link = getEsmLinkByName(ExampleLinkName.APIAndEvents);

vpTest(`Test if video on ESM API and Events page can play as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testApiAndEventsPageVideoIsPlaying(page, pomPages, link);
});
