import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const SINGLE_VIDEO_WITH_ADS_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';
const PLAYLIST_WITH_ADS_VIDEO_SELECTOR = '//*[@id="player-playlist_html5_api"]';

/**
 * Video player examples vast and vpaid page object
 */
export class VastAndVpaidPage extends BasePage {
    public singleVideoWithAdsVideoComponent: VideoComponent;
    public playlistWithAdsVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.singleVideoWithAdsVideoComponent = new VideoComponent(page, SINGLE_VIDEO_WITH_ADS_VIDEO_SELECTOR);
        this.playlistWithAdsVideoComponent = new VideoComponent(page, PLAYLIST_WITH_ADS_VIDEO_SELECTOR);
    }
}
