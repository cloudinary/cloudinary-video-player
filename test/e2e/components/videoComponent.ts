import { expect, Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/**
 * Video component
 */
export class VideoComponent extends BaseComponent {
    constructor(page: Page, videoSelector: string) {
        super({ page, selector: videoSelector });
    }

    /**
     * Click the play button if necessary in case video is not autoplay
     */
    public async clickPlay(): Promise<void> {
        const videoPlayButtonLocator = this.props.page.locator(`${this.props.selector}/following-sibling::button[contains(@class, "vjs-big-play-button")]`);
        // Click the play button to start the video
        return videoPlayButtonLocator.click();
    }

    /**
     * Checks if video element is paused
     */
    public async isPaused(): Promise<boolean> {
        return this.props.page.evaluate((selector: string) => {
            const video = document.evaluate(
                selector, 
                document, 
                null, 
                XPathResult.FIRST_ORDERED_NODE_TYPE, 
                null
              ).singleNodeValue as HTMLVideoElement | null;
              
              if (!video) {
                throw new Error(`Video element with id "${selector}" not found`);
              }              
              return video.paused;
            
        }, this.props.selector);
    }

    /**
     * Validates whether the video is currently playing.
     * This method uses the `isPaused` function to determine the current state of the video.
     * expectedPlaying - A boolean indicating the expected playback state of the video.
     * timeout - Optional. The maximum time (in milliseconds) to wait for the validation. Defaults to 3000ms if not provided.
     * Pass `true` if the video is expected to be playing, or `false` if it is expected to be paused.
     */
    public async validateVideoIsPlaying(expectedPlaying: boolean, timeout: number = 6000): Promise<void> {
        await expect(async () => {
            const isPaused = await this.isPaused();
            expect(isPaused).not.toEqual(expectedPlaying);
        }).toPass({ intervals: [500], timeout });
    }

   /**
 * Validates theme CSS custom properties on the `.cld-video-player` wrapper ancestor.
 */
public async validateColors(
    expectedColors: { base: string; accent: string; text: string },
    timeout: number = 10000
  ): Promise<void> {
    const wrapperLocator = this.locator.locator('xpath=ancestor::div[contains(@class, "cld-video-player")]');
  
    await expect(async () => {
      const colors = await wrapperLocator.evaluate((el) => {
        const styles = getComputedStyle(el as HTMLElement);
        return {
          base: styles.getPropertyValue('--color-base').trim(),
          accent: styles.getPropertyValue('--color-accent').trim(),
          text: styles.getPropertyValue('--color-text').trim(),
        };
      });
  
      expect(colors.base.toLowerCase()).toBe(expectedColors.base.toLowerCase());
      expect(colors.accent.toLowerCase()).toBe(expectedColors.accent.toLowerCase());
      expect(colors.text.toLowerCase()).toBe(expectedColors.text.toLowerCase());
    }).toPass({ intervals: [500], timeout });
  }
}
