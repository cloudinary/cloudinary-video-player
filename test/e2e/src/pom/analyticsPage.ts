import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const ANALYTICS_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples analytics page object
 */
export class AnalyticsPage extends BasePage {
    public analyticsVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.analyticsVideoComponent = new VideoComponent(page, ANALYTICS_PAGE_VIDEO_SELECTOR);
    }
}
