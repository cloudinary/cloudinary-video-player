import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const DISPLAY_CONFIGURATIONS_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples components page object
 */
export class DisplayConfigurationsPage extends BasePage {
    public displayConfigurationsPageVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.displayConfigurationsPageVideoComponent = new VideoComponent(page, DISPLAY_CONFIGURATIONS_PAGE_VIDEO_SELECTOR);
    }
}
