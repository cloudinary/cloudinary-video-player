import { Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/**
 * Video component
 */
export class VideoComponent extends BaseComponent{

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
            console.log('Evaluating selector in browser context:', selector); // Logs selector in browser context
            const xpathResult = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            const video = xpathResult.singleNodeValue as HTMLVideoElement | null;
            return video.paused;
        }, this.props.selector);
    }
}
