import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const PLAYLIST_BY_TAG_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples playlist by tag page object
 */
export class PlaylistByTagPage extends BasePage {
    public playlistByTagVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.playlistByTagVideoComponent = new VideoComponent(page, PLAYLIST_BY_TAG_PAGE_VIDEO_SELECTOR);
    }
}
