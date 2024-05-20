import { ConsoleMessage, test } from '@playwright/test';
import { VideoPlayerExamplesPage } from '../src/pom/videoPlayerExamplesPage';


type FixtureParams = {
  consoleErrors: ConsoleMessage[];
  vpExamples: VideoPlayerExamplesPage;
};

export const vpTest = test.extend<FixtureParams>({
  
  vpExamples: [async ({ page }, use) => {
    const vpExamplePage = new VideoPlayerExamplesPage(page);
    await vpExamplePage.goto();
    await use(vpExamplePage);
  }, { auto: true}],

  consoleErrors: [async ({ page }, use) => {
    const consoleLogs = new Array<ConsoleMessage>();
    page.on('console', msg => {
      if (msg.type() === 'error')
        consoleLogs.push(msg);
    });
    await use(consoleLogs);
  }, {scope: 'test'}],
});
