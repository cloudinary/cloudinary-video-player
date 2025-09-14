import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const HIGHLIGHTS_GRAPH_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples highlight graph page object
 */
export class HighlightsGraphPage extends BasePage {
    public videoHighlightsGraphPage: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.videoHighlightsGraphPage = new VideoComponent(page, HIGHLIGHTS_GRAPH_PAGE_VIDEO_SELECTOR);
    }
}
