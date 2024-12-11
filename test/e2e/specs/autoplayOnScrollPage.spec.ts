import { vpTest } from '../fixtures/vpTest';
import { expect, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

// Link to autoplay on scroll page
const link = getLinkByName(ExampleLinkName.AutoplayOnScroll);
/**
 * Testing if video on autoplay on scroll page is playing.
 * First making sure that video is not playing before scrolling.
 * Then, scroll until video element is visible and make sure video is playing by checking that is pause return false.
 */
vpTest(`Test if video on autoplay on scroll page is playing as expected`, async ({ page, pomPages }) => {
  await test.step('Navigate to autoplay on scroll page by clicking on link', async () => {
    await pomPages.mainPage.clickLinkByName(link.name);
    await waitForPageToLoadWithTimeout(page, 5000);
  });
  await test.step('Validating that the video is not playing before scrolling (in case isPause is true)', async () => {
    expect(await pomPages.autoplayOnScrollPage.autoplayOnScrollVideoComponent.isPaused()).toEqual(true);
  });
  await test.step('Scroll until the video element is visible', async () => {
    await pomPages.autoplayOnScrollPage.scrollToVideoElement();
  });
  await test.step('Validating that the video is auto playing after scrolling (in case isPause is false)', async () => {
    await expect(async () => {
      expect(await pomPages.autoplayOnScrollPage.autoplayOnScrollVideoComponent.isPaused()).toEqual(false);
    }).toPass({ intervals: [2], timeout: 1000 });
  })
});
