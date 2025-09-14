import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const VR_360_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples VR 360 videos page object
 */
export class Vr360VideosPage extends BasePage {
    public vr360VideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.vr360VideoComponent = new VideoComponent(page, VR_360_VIDEO_SELECTOR);
    }
}
