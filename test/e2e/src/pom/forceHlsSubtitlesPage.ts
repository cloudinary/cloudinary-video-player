import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const FORCE_HLS_SUBTITLES_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples force HLS subtitles page object
 */
export class ForceHlsSubtitlesPage extends BasePage {
    public forceHlsSubtitlesVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.forceHlsSubtitlesVideoComponent = new VideoComponent(page, FORCE_HLS_SUBTITLES_PAGE_VIDEO_SELECTOR);
    }
}
