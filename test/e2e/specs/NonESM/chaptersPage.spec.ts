import { vpTest } from '../../fixtures/vpTest';
import { getLinkByName } from '../../testData/pageLinksData';
import { ExampleLinkName } from '../../testData/ExampleLinkNames';
import { testChaptersPageVideosArePlaying } from '../commonSpecs/chaptersPage';

const link = getLinkByName(ExampleLinkName.Chapters);

vpTest(`Test if 3 videos on chapters page are playing as expected`, async ({ page, pomPages }) => {
    await testChaptersPageVideosArePlaying(page, pomPages, link);
});
