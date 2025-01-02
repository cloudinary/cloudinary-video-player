import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const FLUID_LAYOUTS_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples fluid layouts page object
 */
export class FluidLayoutsPage extends BasePage {
    public fluidLayoutsVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.fluidLayoutsVideoComponent = new VideoComponent(page, FLUID_LAYOUTS_PAGE_VIDEO_SELECTOR);
    }
}
