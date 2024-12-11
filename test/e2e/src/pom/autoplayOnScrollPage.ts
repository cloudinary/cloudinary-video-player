import { expect, Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const AUTOPLAY_ON_SCROLL_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples autoplay on scroll page object
 */
export class AutoplayOnScrollPage extends BasePage {
  public autoplayOnScrollVideoComponent: VideoComponent;

  constructor(page: Page) {
    super(page);
    this.autoplayOnScrollVideoComponent = new VideoComponent(page, AUTOPLAY_ON_SCROLL_PAGE_VIDEO_SELECTOR);
  }

  /**
   * Scrolls the page until the video element is visible using scrollIntoViewIfNeeded method.
   * This action ensures the autoplay behavior is triggered when the video comes into view.
   */
  async scrollToVideoElement() {
      await this.page.locator(AUTOPLAY_ON_SCROLL_PAGE_VIDEO_SELECTOR).scrollIntoViewIfNeeded();
  }
}