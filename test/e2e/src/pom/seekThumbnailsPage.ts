import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const SEEK_THUMBNAILS_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples seek thumbnails page object
 */
export class SeekThumbnailsPage extends BasePage {
    public seekThumbnailsVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.seekThumbnailsVideoComponent = new VideoComponent(page, SEEK_THUMBNAILS_PAGE_VIDEO_SELECTOR);
    }
}
