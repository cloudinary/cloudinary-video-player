import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';

const VISUAL_SEARCH_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';
const VISUAL_SEARCH_PLAYLIST_VIDEO_SELECTOR = '//*[@id="player-playlist_html5_api"]';

/**
 * Video player examples visual search page object
 */
export class VisualSearchPage extends BasePage {
    public visualSearchVideoComponent: VideoComponent;
    public visualSearchPlaylistVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.visualSearchVideoComponent = new VideoComponent(page, VISUAL_SEARCH_PAGE_VIDEO_SELECTOR);
        this.visualSearchPlaylistVideoComponent = new VideoComponent(page, VISUAL_SEARCH_PLAYLIST_VIDEO_SELECTOR);
    }
}
