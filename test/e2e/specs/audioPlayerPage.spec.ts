import { vpTest } from '../fixtures/vpTest';
import { expect, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

// Link to audio player page
const link = getLinkByName(ExampleLinkName.AudioPlayer);
/**
 * Testing if videos on audio player page are playing by checking that is pause return false.
 */
vpTest(`Test if 2 videos on audio player page are playing as expected`, async ({ page, pomPages }) => {
  await test.step('Navigate to audio player page by clicking on link', async () => {
    await pomPages.mainPage.clickLinkByName(link.name);
    await waitForPageToLoadWithTimeout(page, 5000);
  });
  await test.step('Click on play button of first video player to play video', async () => {
    return pomPages.audioPlayerPage.audioPlayerVideoComponent.clickPlay();
  });
  await test.step('Validating that the first video is playing (in case isPause is false)', async () => {
    expect(await pomPages.audioPlayerPage.audioPlayerVideoComponent.isPaused()).toEqual(false);
  });
  await test.step('Click on play button of second video player to play video', async () => {
    return pomPages.audioPlayerPage.audioPlayerWithTransformationVideoComponent.clickPlay();
  });
  await test.step('Validating that the second video is playing (in case isPause is false)', async () => {
    expect(await pomPages.audioPlayerPage.audioPlayerWithTransformationVideoComponent.isPaused()).toEqual(false);
  });
});