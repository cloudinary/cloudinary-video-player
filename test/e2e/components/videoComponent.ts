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
              return video.paused && !video.ended;
            
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
            expect(await this.isPaused()).not.toEqual(expectedPlaying);
        }).toPass({ intervals: [500], timeout });
    }
}
