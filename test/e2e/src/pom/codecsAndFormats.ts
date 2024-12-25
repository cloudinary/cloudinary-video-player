import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const CODECS_AND_FORMAT_PAGE_F_AUTO_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';
const CODECS_AND_FORMAT_PAGE_AV1_VIDEO_SELECTOR = '//*[@id="player-av1_html5_api"]';
const CODECS_AND_FORMAT_PAGE_VP9_VIDEO_SELECTOR = '//*[@id="player-vp9_html5_api"]';

/**
 * Video player examples chapters page object
 */
export class CodecsAndFormats extends BasePage {
    public codecsAndFormatsFAutoVideoComponent: VideoComponent;
    public codecsAndFormatsAv1VideoComponent: VideoComponent;
    public codecsAndFormatsVp9VideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.codecsAndFormatsFAutoVideoComponent = new VideoComponent(page, CODECS_AND_FORMAT_PAGE_F_AUTO_VIDEO_SELECTOR);
        this.codecsAndFormatsAv1VideoComponent = new VideoComponent(page, CODECS_AND_FORMAT_PAGE_AV1_VIDEO_SELECTOR);
        this.codecsAndFormatsVp9VideoComponent = new VideoComponent(page, CODECS_AND_FORMAT_PAGE_VP9_VIDEO_SELECTOR);
    }
}
