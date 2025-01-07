import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const FLOATING_PLAYER_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples Floating player page object
 */
export class FloatingPlayerPage extends BasePage {
    public floatingPlayerVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.floatingPlayerVideoComponent = new VideoComponent(page, FLOATING_PLAYER_PAGE_VIDEO_SELECTOR);
    }
}
