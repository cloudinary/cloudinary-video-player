import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const API_AND_EVENTS_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples api and events page object
 */
export class ApiAndEventsPage extends BasePage {
    public apiAndEventsVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.apiAndEventsVideoComponent = new VideoComponent(page, API_AND_EVENTS_PAGE_VIDEO_SELECTOR);
    }
}
