import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';

const SHARE_PLUGIN_PLAYER1_SELECTOR = '//*[@id="player1_html5_api"]';
const SHARE_PLUGIN_PLAYER2_SELECTOR = '//*[@id="player2_html5_api"]';

/**
 * Share & Download example page object
 */
export class SharePluginPage extends BasePage {
    public sharePluginPlayer1VideoComponent: VideoComponent;
    public sharePluginPlayer2VideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.sharePluginPlayer1VideoComponent = new VideoComponent(page, SHARE_PLUGIN_PLAYER1_SELECTOR);
        this.sharePluginPlayer2VideoComponent = new VideoComponent(page, SHARE_PLUGIN_PLAYER2_SELECTOR);
    }
}
