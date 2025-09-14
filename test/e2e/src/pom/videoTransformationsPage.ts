import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const VIA_SOURCE_VIDEO_SELECTOR = '//*[@id="player-1_html5_api"]';
const VIA_PLAYER_VIDEO_SELECTOR = '//*[@id="player-2_html5_api"]';
const VIA_DATA_CLD_TRANSFORMATIONS_VIDEO_SELECTOR = '//*[@id="player-3_html5_api"]';

/**
 * Video player examples video transformations page object
 */
export class VideoTransformationsPage extends BasePage {
    public viaSourceVideoComponent: VideoComponent;
    public viaPlayerVideoComponent: VideoComponent;
    public viaDataCldTransformationsVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.viaSourceVideoComponent = new VideoComponent(page, VIA_SOURCE_VIDEO_SELECTOR);
        this.viaPlayerVideoComponent = new VideoComponent(page, VIA_PLAYER_VIDEO_SELECTOR);
        this.viaDataCldTransformationsVideoComponent = new VideoComponent(page, VIA_DATA_CLD_TRANSFORMATIONS_VIDEO_SELECTOR);
    }
}
