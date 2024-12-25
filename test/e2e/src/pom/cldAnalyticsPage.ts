import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const CLD_ANALYTICS_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';
const CLD_ANALYTICS_PAGE_ADP_VIDEO_SELECTOR = '//*[@id="adpPlayer_html5_api"]';
const CLD_ANALYTICS_PAGE_CUSTOM_DATA_OBJECT_VIDEO_SELECTOR = '//*[@id="player-custom-data-plain-object_html5_api"]';
const CLD_ANALYTICS_PAGE_CUSTOM_DATA_FUNCTION_VIDEO_SELECTOR = '//*[@id="player-custom-data-function_html5_api"]';

/**
 * Video player examples chapters page object
 */
export class CldAnalyticsPage extends BasePage {
    public cldAnalyticsVideoComponent: VideoComponent;
    public cldAnalyticsAdpVideoComponent: VideoComponent;
    public cldAnalyticsCustomDataObjectVideoComponent: VideoComponent;
    public cldAnalyticsCustomDataFunctionVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.cldAnalyticsVideoComponent = new VideoComponent(page, CLD_ANALYTICS_PAGE_VIDEO_SELECTOR);
        this.cldAnalyticsAdpVideoComponent = new VideoComponent(page, CLD_ANALYTICS_PAGE_ADP_VIDEO_SELECTOR);
        this.cldAnalyticsCustomDataObjectVideoComponent = new VideoComponent(page, CLD_ANALYTICS_PAGE_CUSTOM_DATA_OBJECT_VIDEO_SELECTOR);
        this.cldAnalyticsCustomDataFunctionVideoComponent = new VideoComponent(page, CLD_ANALYTICS_PAGE_CUSTOM_DATA_FUNCTION_VIDEO_SELECTOR);
    }
}
