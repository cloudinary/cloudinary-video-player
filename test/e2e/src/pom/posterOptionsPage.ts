import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const POSTER_OPTIONS_PAGE_CUSTOM_IMAGE_VIDEO_SELECTOR = '//*[@id="player-image-poster_html5_api"]';
const POSTER_OPTIONS_PAGE_SPECIFIC_FRAME_VIDEO_SELECTOR = '//*[@id="player-frame-0_html5_api"]';
const POSTER_OPTIONS_PAGE_TRANSFORMATIONS_ARRAY_VIDEO_SELECTOR = '//*[@id="player-poster-options_html5_api"]';
const POSTER_OPTIONS_PAGE_RAW_URL_NO_POSTER_VIDEO_SELECTOR = '//*[@id="player-raw_html5_api"]';

/**
 * Video player examples poster options page object
 */
export class PosterOptionsPage extends BasePage {
    public posterOptionsCustomImageVideoComponent: VideoComponent;
    public posterOptionsSpecificFrameVideoComponent: VideoComponent;
    public posterOptionsTransformationsArrayVideoComponent: VideoComponent;
    public posterOptionsRawUrlNoPosterVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.posterOptionsCustomImageVideoComponent = new VideoComponent(page, POSTER_OPTIONS_PAGE_CUSTOM_IMAGE_VIDEO_SELECTOR);
        this.posterOptionsSpecificFrameVideoComponent = new VideoComponent(page, POSTER_OPTIONS_PAGE_SPECIFIC_FRAME_VIDEO_SELECTOR);
        this.posterOptionsTransformationsArrayVideoComponent = new VideoComponent(page, POSTER_OPTIONS_PAGE_TRANSFORMATIONS_ARRAY_VIDEO_SELECTOR);
        this.posterOptionsRawUrlNoPosterVideoComponent = new VideoComponent(page, POSTER_OPTIONS_PAGE_RAW_URL_NO_POSTER_VIDEO_SELECTOR);
    }
}
