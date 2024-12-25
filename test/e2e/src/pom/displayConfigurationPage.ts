import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const DISPLAY_CONFIGURATION_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples components page object
 */
export class DisplayConfigurationPage extends BasePage {
    public displayConfigurationPageVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.displayConfigurationPageVideoComponent = new VideoComponent(page, DISPLAY_CONFIGURATION_PAGE_VIDEO_SELECTOR);
    }
}
