import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const PLAYLIST_PAGE_HORIZONTAL_VIDEO_SELECTOR = '//*[@id="player-horizontal_html5_api"]';
const PLAYLIST_PAGE_VERTICAL_VIDEO_SELECTOR = '//*[@id="player-vertical_html5_api"]';

/**
 * Video player examples playlist page object
 */
export class PlaylistPage extends BasePage {
    public playlistHorizontalVideoComponent: VideoComponent;
    public playlistVerticalVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.playlistHorizontalVideoComponent = new VideoComponent(page, PLAYLIST_PAGE_HORIZONTAL_VIDEO_SELECTOR);
        this.playlistVerticalVideoComponent = new VideoComponent(page, PLAYLIST_PAGE_VERTICAL_VIDEO_SELECTOR);
    }
}
