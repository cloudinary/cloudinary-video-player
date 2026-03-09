import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';

const ASPECT_RATIO_CROP_VIDEO_SELECTOR = '//*[@id="player-1_html5_api"]';

/**
 * Video player examples aspect ratio & crop page object
 */
export class AspectRatioCropPage extends BasePage {
    public videoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.videoComponent = new VideoComponent(page, ASPECT_RATIO_CROP_VIDEO_SELECTOR);
    }
}
