import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';

const HDR_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples HDR page object
 */
export class HdrPage extends BasePage {
    public hdrVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.hdrVideoComponent = new VideoComponent(page, HDR_PAGE_VIDEO_SELECTOR);
    }
}
