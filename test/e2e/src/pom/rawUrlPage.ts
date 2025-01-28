import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const RAW_URL_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';
const RAW_URL_PAGE_ADAPTIVE_VIDEO_SELECTOR = '//*[@id="adpPlayer_html5_api"]';

/**
 * Video player examples raw URL page object
 */
export class RawUrlPage extends BasePage {
    public rawUrlVideoComponent: VideoComponent;
    public rawUrlAdaptiveVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.rawUrlVideoComponent = new VideoComponent(page, RAW_URL_PAGE_VIDEO_SELECTOR);
        this.rawUrlAdaptiveVideoComponent = new VideoComponent(page, RAW_URL_PAGE_ADAPTIVE_VIDEO_SELECTOR);
    }
}
