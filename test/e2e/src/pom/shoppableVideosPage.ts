import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const SHOPPABLE_VIDEOS_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples shoppable vidoes page object
 */
export class ShoppableVideosPage extends BasePage {
    public shoppableVideosVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.shoppableVideosVideoComponent = new VideoComponent(page, SHOPPABLE_VIDEOS_PAGE_VIDEO_SELECTOR);
    }
}
