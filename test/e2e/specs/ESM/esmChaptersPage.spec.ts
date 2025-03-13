import { vpTest } from '../../fixtures/vpTest';
import { ESM_URL } from '../../testData/esmUrl';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { getEsmLinkByName } from '../../testData/esmPageLinksData';
import { testChaptersPageVideosArePlaying } from '../commonSpecs/chaptersPage';

const link = getEsmLinkByName(ExampleLinkName.Chapters);

vpTest(`Test if 3 videos on ESM chapters page are playing as expected`, async ({ page, pomPages }) => {
    await page.goto(ESM_URL);
    await testChaptersPageVideosArePlaying(page, pomPages, link);
});
