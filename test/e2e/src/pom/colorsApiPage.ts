import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const COLORS_API_PAGE_COLOR_SKIN_VIDEO_SELECTOR = '//*[@id="vjs_video_3_html5_api"]';
const COLORS_API_PAGE_DARK_SKIN_VIDEO_SELECTOR = '//*[@id="vjs_video_627_html5_api"]';
const COLORS_API_PAGE_LIGHT_SKIN_VIDEO_SELECTOR = '//*[@id="vjs_video_1229_html5_api"]';

/**
 * Video player examples colors API page object
 */
export class ColorsApiPage extends BasePage {
    public colorsApiColorSkinVideoComponent: VideoComponent;
    public colorsApiDarkSkinVideoComponent: VideoComponent;
    public colorsApiLightSkinVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.colorsApiColorSkinVideoComponent = new VideoComponent(page, COLORS_API_PAGE_COLOR_SKIN_VIDEO_SELECTOR);
        this.colorsApiDarkSkinVideoComponent = new VideoComponent(page, COLORS_API_PAGE_DARK_SKIN_VIDEO_SELECTOR);
        this.colorsApiLightSkinVideoComponent = new VideoComponent(page, COLORS_API_PAGE_LIGHT_SKIN_VIDEO_SELECTOR);
    }
}
