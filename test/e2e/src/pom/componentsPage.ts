import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const COMPONENTS_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples components page object
 */
export class ComponentsPage extends BasePage {
    public componentsVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.componentsVideoComponent = new VideoComponent(page, COMPONENTS_PAGE_VIDEO_SELECTOR);
    }
}
