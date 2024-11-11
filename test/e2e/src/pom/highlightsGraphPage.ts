import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
const HIGHLIGHTS_GRAPH_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples highlight graph page object
 */
export class HighlightsGraphPage {
    public videoHighlightsGraphPage: VideoComponent;

    constructor(page: Page) {
        this.videoHighlightsGraphPage = new VideoComponent(page, HIGHLIGHTS_GRAPH_PAGE_VIDEO_SELECTOR);
    }
}
