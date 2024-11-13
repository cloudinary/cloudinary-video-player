import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const MAIN_PAGE_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';

/**
 * Video player examples main page object
 */
export class MainPage extends BasePage {
    public videoMainPage: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.videoMainPage = new VideoComponent(page, MAIN_PAGE_VIDEO_SELECTOR);
    }

    /**
     * Click links by given name.
     */
    public async clickLinkByName(name: string): Promise<void> {
        await this.page.getByRole('link', { name, exact: true }).click();
        await this.page.waitForLoadState('load');
    }

    /**
     * Navigate to local examples page.
     */
    public async goto(): Promise<void> {
        await this.page.goto('http://localhost:3000/index.html');
    }
}
