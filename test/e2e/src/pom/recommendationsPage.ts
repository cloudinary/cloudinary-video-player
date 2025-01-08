import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const RECOMMENDATIONS_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples recommendations page object
 */
export class RecommendationsPage extends BasePage {
    public recommendationsVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.recommendationsVideoComponent = new VideoComponent(page, RECOMMENDATIONS_PAGE_VIDEO_SELECTOR);
    }
}
