import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const CHAPTERS_PAGE_VTT_FILE_VIDEO_SELECTOR = '//*[@id="player-vtt_html5_api"]';
const CHAPTERS_PAGE_CONFIG_OBJECT_VIDEO_SELECTOR = '//*[@id="player-config_html5_api"]';
const CHAPTERS_PAGE_AUTO_VTT_FILE_VIDEO_SELECTOR = '//*[@id="player-auto-vtt_html5_api"]';

/**
 * Video player examples chapters page object
 */
export class ChaptersPage extends BasePage {
    public chaptersVttFIleVideoComponent: VideoComponent;
    public chaptersConfigObjectVideoComponent: VideoComponent;
    public chapterAutoVttFileVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.chaptersVttFIleVideoComponent = new VideoComponent(page, CHAPTERS_PAGE_VTT_FILE_VIDEO_SELECTOR);
        this.chaptersConfigObjectVideoComponent = new VideoComponent(page, CHAPTERS_PAGE_CONFIG_OBJECT_VIDEO_SELECTOR);
        this.chapterAutoVttFileVideoComponent = new VideoComponent(page, CHAPTERS_PAGE_AUTO_VTT_FILE_VIDEO_SELECTOR);
    }
}
